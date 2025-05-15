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
import Layout from "../components/Layout";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");
  const [savedEmails, setSavedEmails] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [userId, setUserId] = useState(null);

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
      alert("Enter a topic and select a tone first.");
      return;
    }

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
  }

  async function handleSave() {
    if (!response.trim()) return;

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
  }

  async function handleRevise(email) {
    const feedback = feedbacks[email.id] || "";
    if (!feedback.trim()) return;

    setLoadingId(email.id);

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

    await updateDoc(doc(db, "emails", email.id), {
      feedbackText: feedback,
      revision: data.result,
    });

    // ✅ Auto-save revision to Firestore if enabled
    if (autoSave && data.result.trim()) {
      await updateDoc(doc(db, "emails", email.id), {
        revision: data.result,
        revisionSavedAt: new Date().toISOString(),
      });
    }

    setLoadingId(null);
    fetchEmails();
  }

  async function handleApprove(id) {
    const emailDoc = savedEmails.find((e) => e.id === id);
    if (!emailDoc || !emailDoc.generatedEmail) return;

    const res = await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: emailDoc.generatedEmail }),
    });

    const data = await res.json();

    await updateDoc(doc(db, "emails", id), {
      approved: true,
      embedding: data.embedding,
    });

    fetchEmails();
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
      <h1>Generate an Email</h1>

      <label>Choose a tone:</label>
      <select
        onChange={(e) =>
          setSelectedVoice(voices.find((v) => v.id === e.target.value))
        }
        value={selectedVoice?.id || ""}
      >
        <option value="">-- Select --</option>
        {voices.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <textarea
        placeholder="What do you want to say?"
        rows={3}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{ width: "100%", marginTop: "1rem" }}
      />

      <button onClick={handleGenerate}>Generate Email</button>

      {response && !autoSave && (
        <>
          <h3>Generated Email</h3>
          <textarea
            rows={6}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            style={{ width: "100%" }}
          />
          <button onClick={handleSave}>Save Email</button>
        </>
      )}

      <h2 style={{ marginTop: "3rem" }}>Your Saved Emails</h2>
      {savedEmails.map((email) => (
        <div key={email.id} style={{ marginBottom: "2rem" }}>
          <strong>Prompt:</strong> {email.originalTopic}
          <br />
          <strong>Email:</strong>
          <pre>{email.generatedEmail}</pre>

          <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
            <button onClick={() => copyToClipboard(email.generatedEmail)}>📋 Copy</button>
            <button onClick={() => openInGmail(email.generatedEmail)}>📧 Gmail</button>
            <button onClick={() => downloadTextFile(`email-${email.id}.txt`, email.generatedEmail)}>💾 Download</button>
          </div>

          <textarea
            placeholder="Feedback for revision"
            value={feedbacks[email.id] || ""}
            onChange={(e) =>
              setFeedbacks({ ...feedbacks, [email.id]: e.target.value })
            }
          />
          <button onClick={() => handleRevise(email)}>
            {loadingId === email.id ? "Revising..." : "Revise with AI"}
          </button>

          {email.revision && (
            <>
              <p><strong>AI Revision:</strong></p>
              <pre>{email.revision}</pre>
              <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
                <button onClick={() => copyToClipboard(email.revision)}>📋 Copy</button>
                <button onClick={() => openInGmail(email.revision)}>📧 Gmail</button>
                <button onClick={() => downloadTextFile(`revision-${email.id}.txt`, email.revision)}>💾 Download</button>
              </div>
              {!email.approved ? (
                <button onClick={() => handleApprove(email.id)}>
                  ✅ Approve for Training
                </button>
              ) : (
                <p style={{ color: "green" }}>✅ Approved</p>
              )}
            </>
          )}
        </div>
      ))}
    </Layout>
  );
}
