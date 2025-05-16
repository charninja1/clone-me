import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Layout, Card, Button, Select, TextArea, AlertBanner, Badge, EmailDisplay } from "../components";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");
  const [savedEmails, setSavedEmails] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");

  const [autoSave, setAutoSave] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [autoGmail, setAutoGmail] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        initUser(user.uid);
      }
    });
    return () => unsubAuth();
  }, []);

  async function initUser(uid) {
    await fetchVoices(uid);
    await fetchEmails(uid);

    const userRef = doc(db, "users", uid);

    onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const defaultVoiceId = data.defaultVoiceId;
        const defaultVoice = voices.find((v) => v.id === defaultVoiceId);
        if (defaultVoice) setSelectedVoice(defaultVoice);

        setAutoSave(data.settings?.autoSave || false);
        setAutoCopy(data.settings?.autoCopy || false);
        setAutoGmail(data.settings?.autoGmail || false);
      }
    });
  }

  async function fetchVoices(uid = userId) {
    const snapshot = await getDocs(
      query(collection(db, "voices"), where("userId", "==", uid))
    );
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVoices(list);
  }

  async function fetchEmails(uid = userId) {
    const q = query(
      collection(db, "emails"),
      where("userId", "==", uid),
      orderBy("editedAt", "desc")
    );
    const snapshot = await getDocs(q);
    const emails = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSavedEmails(emails);
  }

  function cosineSim(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
    return dot / (magA * magB);
  }

  async function getTop3RelevantExamples(prompt) {
    const res = await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: prompt }),
    });

    const data = await res.json();
    const promptVec = data.embedding;

    const relevant = savedEmails.filter(
      (e) => e.approved && e.voiceId === selectedVoice?.id && Array.isArray(e.embedding)
    );

    const scored = relevant.map((e) => ({
      ...e,
      score: cosineSim(e.embedding, promptVec),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((e) => `- ${e.generatedEmail}`)
      .join("\n");
  }

  async function handleGenerate() {
    if (!topic || !selectedVoice) {
      setError("Please enter a topic and select a tone first.");
      return;
    }

    setError("");
    setIsGenerating(true);
    try {
      const topExamples = await getTop3RelevantExamples(topic);

      const prompt = `
You are writing an email for a college student named Charlie.
Use this instruction: "${selectedVoice.instructions}"

Charlie's topic is: "${topic}"

Here are some previously approved emails from this tone:
${topExamples || "[None yet]"}

Now generate a new email in the same style.
`;

      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate email");
      }
      
      setResponse(data.result);

      if (autoSave && data.result.trim()) {
        await addDoc(collection(db, "emails"), {
          userId,
          voiceId: selectedVoice.id,
          originalTopic: topic,
          generatedEmail: data.result,
          feedbackText: "",
          revision: "",
          approved: false,
          editedAt: new Date().toISOString(),
        });
        fetchEmails();
      }

      if (autoCopy) copyToClipboard(data.result);
      if (autoGmail) openInGmail(data.result);
    } catch (err) {
      setError("Error generating email: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!response.trim()) return;
    
    try {
      await addDoc(collection(db, "emails"), {
        userId,
        voiceId: selectedVoice.id,
        originalTopic: topic,
        generatedEmail: response,
        feedbackText: "",
        revision: "",
        approved: false,
        editedAt: new Date().toISOString(),
      });

      setTopic("");
      setResponse("");
      fetchEmails();
    } catch (err) {
      setError("Error saving email: " + err.message);
    }
  }

  async function handleRevise(email) {
    const feedback = feedbacks[email.id] || "";
    if (!feedback.trim()) {
      setError("Please provide feedback for revision.");
      return;
    }

    setError("");
    setLoadingId(email.id);

    try {
      const prompt = `
Revise the following email from Charlie:
"${email.generatedEmail}"

Charlie's feedback is: "${feedback}"
`;

      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to revise email");
      }

      await updateDoc(doc(db, "emails", email.id), {
        feedbackText: feedback,
        revision: data.result,
      });

      // Auto-save revision to Firestore if enabled
      if (autoSave && data.result.trim()) {
        await updateDoc(doc(db, "emails", email.id), {
          revision: data.result,
          revisionSavedAt: new Date().toISOString(),
        });
      }

      fetchEmails();
    } catch (err) {
      setError("Error revising email: " + err.message);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleApprove(id) {
    const emailDoc = savedEmails.find((e) => e.id === id);
    if (!emailDoc || !emailDoc.generatedEmail) return;

    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: emailDoc.generatedEmail }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate embedding");
      }

      await updateDoc(doc(db, "emails", id), {
        approved: true,
        embedding: data.embedding,
      });

      fetchEmails();
    } catch (err) {
      setError("Error approving email: " + err.message);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  function openInGmail(text) {
    const subject = encodeURIComponent("Follow-up from Charlie");
    const body = encodeURIComponent(text);
    const mailto = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailto, "_blank");
  }

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary-700 mb-8">Generate an Email</h1>

        {/* Generation form */}
        <Card className="mb-10">
          {error && (
            <AlertBanner
              type="error"
              message={error}
              className="mb-6"
              onClose={() => setError("")}
            />
          )}

          <div className="space-y-6">
            <Select
              id="tone-select"
              label="Choose a tone:"
              className="max-w-md"
              value={selectedVoice?.id || ""}
              onChange={(e) => setSelectedVoice(voices.find((v) => v.id === e.target.value))}
              options={voices.map(voice => ({ value: voice.id, label: voice.name }))}
              required
            />

            <TextArea
              id="topic"
              label="What do you want to say?"
              placeholder="e.g. I need to ask for an extension on my paper due Friday..."
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />

            <div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                isLoading={isGenerating}
              >
                Generate Email
              </Button>
            </div>
          </div>

          {response && !autoSave && (
            <div className="mt-8 border-t border-surface-200 pt-6">
              <h3 className="text-lg font-medium text-surface-900 mb-3">Generated Email</h3>
              <TextArea
                rows={8}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
              <div className="mt-4 flex space-x-3">
                <Button 
                  onClick={handleSave}
                  variant="primary"
                >
                  Save Email
                </Button>
                <Button
                  onClick={() => copyToClipboard(response)}
                  variant="outline"
                  icon={<span>📋</span>}
                >
                  Copy
                </Button>
                <Button
                  onClick={() => openInGmail(response)}
                  variant="outline"
                  icon={<span>📧</span>}
                >
                  Open in Gmail
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Saved emails */}
        <div>
          <h2 className="text-xl font-semibold text-surface-800 mb-6">Your Saved Emails</h2>
          
          {savedEmails.length === 0 ? (
            <Card className="text-center p-8 bg-surface-50">
              <p className="text-surface-600">No saved emails yet. Generate your first one above.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              {savedEmails.map((email) => (
                <Card key={email.id} className="overflow-hidden p-0">
                  <div className="p-6">
                    {/* Email header */}
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div className="mb-2 mr-4">
                        <span className="block text-xs font-medium text-surface-500 mb-1">
                          Topic:
                        </span>
                        <h3 className="text-lg font-medium text-surface-900">
                          {email.originalTopic}
                        </h3>
                      </div>
                      {email.approved && (
                        <Badge variant="success">
                          ✅ Approved
                        </Badge>
                      )}
                    </div>
                    
                    {/* Original email */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-surface-700 mb-2">Email:</h4>
                      <EmailDisplay 
                        email={email.generatedEmail}
                        onCopy={() => copyToClipboard(email.generatedEmail)}
                        onOpenInGmail={() => openInGmail(email.generatedEmail)}
                        onDownload={() => downloadTextFile(`email-${email.id}.txt`, email.generatedEmail)}
                        showHeader={false}
                      />
                    </div>
                    
                    {/* Feedback and revision section */}
                    <div className="border-t border-surface-200 pt-4">
                      <TextArea
                        id={`feedback-${email.id}`}
                        label="Feedback for revision:"
                        placeholder="What would you like to change in this email?"
                        rows={3}
                        value={feedbacks[email.id] || ""}
                        onChange={(e) => setFeedbacks({ ...feedbacks, [email.id]: e.target.value })}
                        className="mb-3"
                      />
                      <Button
                        onClick={() => handleRevise(email)}
                        disabled={loadingId === email.id}
                        isLoading={loadingId === email.id}
                      >
                        Revise with AI
                      </Button>
                    </div>

                    {/* Revision display (if exists) */}
                    {email.revision && (
                      <div className="mt-6 border-t border-surface-200 pt-4">
                        <h4 className="text-sm font-medium text-surface-700 mb-2">AI Revision:</h4>
                        <EmailDisplay 
                          email={email.revision}
                          onCopy={() => copyToClipboard(email.revision)}
                          onOpenInGmail={() => openInGmail(email.revision)}
                          onDownload={() => downloadTextFile(`revision-${email.id}.txt`, email.revision)}
                          showHeader={false}
                        />
                        
                        {!email.approved && (
                          <div className="mt-4">
                            <Button
                              onClick={() => handleApprove(email.id)}
                              variant="success"
                              icon={<span>✅</span>}
                            >
                              Approve for Training
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}