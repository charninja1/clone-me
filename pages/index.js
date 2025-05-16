import { useState, useEffect, useRef } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Layout, Card, Button, Select, TextArea, AlertBanner, Badge, EmailDisplay } from "../components";
import { useRouter } from 'next/router';
import ContextDetector from "../components/ContextDetector";
import SimpleOnboarding from "../components/SimpleOnboarding";
import SimpleDashboard from "../components/SimpleDashboard";
import InteractiveTutorial from "../components/InteractiveTutorial";
import HelpTooltip from "../components/HelpTooltip";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");
  const [savedEmails, setSavedEmails] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [editedEmails, setEditedEmails] = useState({}); // Track manual edits to emails
  const [editedRevisions, setEditedRevisions] = useState({}); // Track manual edits to revisions
  const [loadingId, setLoadingId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [filterVoiceId, setFilterVoiceId] = useState("all"); // 'all' or a specific voice ID
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");

  const [autoSave, setAutoSave] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [autoGmail, setAutoGmail] = useState(false);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasVoices, setHasVoices] = useState(false);
  const hasCheckedOnboarding = useRef(false);
  
  // Inline editing states
  const [editMode, setEditMode] = useState(false);
  const [editedResponse, setEditedResponse] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        initUser(user.uid);
      }
    });
    return () => unsubAuth();
  }, []);
  
  // Check if user needs onboarding (only once per session)
  useEffect(() => {
    const checkOnboarding = async () => {
      if (userId && !hasCheckedOnboarding.current) {
        hasCheckedOnboarding.current = true;
        
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        if (!userData.hasCompletedOnboarding) {
          setShowOnboarding(true);
        } else if (!userData.hasSeenTutorial && voices.length > 0) {
          setShowTutorial(true);
        }
      }
    };
    
    checkOnboarding();
  }, [userId, voices]);
  
  // Update hasVoices when voices change
  useEffect(() => {
    setHasVoices(voices.length > 0);
  }, [voices]);

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
  
  // Get filtered emails based on selected voice
  function getFilteredEmails() {
    if (filterVoiceId === "all") {
      return savedEmails;
    }
    return savedEmails.filter(email => email.voiceId === filterVoiceId);
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
      setError("Please enter a topic and select a voice first.");
      return;
    }

    setError("");
    setIsGenerating(true);
    try {
      const topExamples = await getTop3RelevantExamples(topic);

      // Call our new API endpoint with userId and toneId
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic,
          userId,
          voiceId: selectedVoice.id,
          examples: topExamples || "[None yet]"
        }),
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
      
      // Initialize edited response for edit mode
      setEditedResponse(data.result);
    } catch (err) {
      setError("Error generating email: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }
  
  async function handleQuickRevision(feedback) {
    try {
      setIsGenerating(true);
      setError("");
      
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalEmail: editedResponse,
          feedback,
          userId,
          voiceId: selectedVoice?.id
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to revise email");
      }
      
      setEditedResponse(data.result);
    } catch (err) {
      setError("Error revising email: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }
  
  async function handleSaveRevision() {
    try {
      setResponse(editedResponse);
      setEditMode(false);
      
      // Save to database if auto-save is enabled
      if (autoSave) {
        await addDoc(collection(db, "emails"), {
          userId,
          voiceId: selectedVoice.id,
          originalTopic: topic,
          generatedEmail: editedResponse,
          feedbackText: "",
          revision: editedResponse,
          approved: false,
          editedAt: new Date().toISOString(),
          isRevision: true
        });
        fetchEmails();
      }
      
      // Copy to clipboard if auto-copy is enabled
      if (autoCopy) copyToClipboard(editedResponse);
    } catch (err) {
      setError("Error saving revision: " + err.message);
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
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          originalEmail: email.generatedEmail,
          feedback,
          userId,
          voiceId: email.voiceId
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to revise email");
      }

      // Save the revision with feedback, adding timestamp regardless of auto-save setting
      await updateDoc(doc(db, "emails", email.id), {
        feedbackText: feedback,
        revision: data.result,
        revisionSavedAt: new Date().toISOString(),
        editedAt: new Date().toISOString(), // Update the main edited timestamp as well
      });

      // Update voice's feedback memory
      if (email.voiceId) {
        const voiceRef = doc(db, "voices", email.voiceId);
        const voiceDoc = await getDoc(voiceRef);
        
        if (voiceDoc.exists()) {
          const currentFeedback = voiceDoc.data().feedbackMemory || [];
          const newFeedback = {
            feedback,
            originalEmail: email.generatedEmail.substring(0, 200), // Store partial for context
            revision: data.result.substring(0, 200),
            timestamp: new Date().toISOString()
          };
          
          // Keep only the last 10 feedback items to prevent unlimited growth
          const updatedFeedback = [...currentFeedback, newFeedback].slice(-10);
          
          await updateDoc(voiceRef, {
            feedbackMemory: updatedFeedback
          });
        }
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

  // Function to save manual edits to the original email
  async function handleEmailEdit(emailId, newContent) {
    try {
      await updateDoc(doc(db, "emails", emailId), {
        generatedEmail: newContent,
        editedAt: new Date().toISOString(),
        userEdited: true,
      });
      
      // Update local state immediately for better UX
      setEditedEmails({
        ...editedEmails,
        [emailId]: newContent
      });
      
      // Refresh emails list from server to ensure consistency
      fetchEmails();
    } catch (err) {
      setError("Error saving edits: " + err.message);
    }
  }
  
  // Function to save manual edits to the revision
  async function handleRevisionEdit(emailId, newContent) {
    try {
      await updateDoc(doc(db, "emails", emailId), {
        revision: newContent,
        editedAt: new Date().toISOString(),
        revisionSavedAt: new Date().toISOString(),
        userEdited: true,
      });
      
      // Update local state immediately for better UX
      setEditedRevisions({
        ...editedRevisions,
        [emailId]: newContent
      });
      
      // Refresh emails list from server to ensure consistency
      fetchEmails();
    } catch (err) {
      setError("Error saving revision edits: " + err.message);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  function openInGmail(text) {
    const subject = encodeURIComponent("Follow-up");
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
      {/* Onboarding Modal */}
      {showOnboarding && (
        <SimpleOnboarding
          onComplete={async () => {
            setShowOnboarding(false);
            // Mark onboarding as complete in the database
            if (userId) {
              await updateDoc(doc(db, "users", userId), {
                hasCompletedOnboarding: true
              });
            }
            // Only redirect to voices if user has no voices
            if (voices.length === 0) {
              window.location.href = '/voices';
            }
          }}
        />
      )}
      
      {/* Tutorial */}
      {showTutorial && (
        <InteractiveTutorial
          steps={[
            {
              target: '#voice-select',
              title: 'Choose Your Voice',
              content: 'Select which voice you want to use for this email',
              position: 'bottom'
            },
            {
              target: '#topic',
              title: 'Tell Me What to Say',
              content: 'Just type what you want your email to be about',
              position: 'top'
            },
            {
              target: '#generate-button',
              title: 'Generate Your Email',
              content: 'Click here and I\'ll write the email for you!',
              position: 'top'
            }
          ]}
          onComplete={async () => {
            setShowTutorial(false);
            if (userId) {
              await updateDoc(doc(db, "users", userId), {
                hasSeenTutorial: true
              });
            }
          }}
          onSkip={() => setShowTutorial(false)}
        />
      )}
      
      {/* Show dashboard for returning users */}
      {!hasVoices && userId && !showOnboarding ? (
        <div className="max-w-6xl mx-auto px-4">
          <SimpleDashboard userId={userId} />
        </div>
      ) : (
        <>
          {/* Simplified Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Write Your Email</h1>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              Tell me what you want to say, and I'll write it for you
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto px-4">

        {/* Generation form */}
        <Card className="mb-12 shadow-lg" variant="gradient" hover={false}>
          {error && (
            <AlertBanner
              type="error"
              message={error}
              className="mb-6"
              onClose={() => setError("")}
            />
          )}

          <div className="space-y-6">
            <div>
              <Select
                id="voice-select"
                label="Choose a voice:"
                className="max-w-md"
                value={selectedVoice?.id || ""}
                onChange={(e) => {
                  const voiceId = e.target.value;
                  setSelectedVoice(voices.find((v) => v.id === voiceId));
                  // Automatically update the filter to show emails with the selected voice
                  setFilterVoiceId(voiceId);
                }}
                options={voices.map(voice => ({ 
                  value: voice.id, 
                  label: `${voice.name} (${voice.trainingLevel || 'Beginner'})` 
                }))}
                required
              />
              
              {selectedVoice && (
                <div className="mt-3 flex items-center space-x-3">
                  <Badge variant={selectedVoice.trainingLevel === 'expert' ? 'success' : 'primary'}>
                    {selectedVoice.trainingLevel || 'Beginner'} Level
                  </Badge>
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {selectedVoice.feedbackMemory?.length || 0} training sessions
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => window.location.href = '/voices'}
                  >
                    Train this voice →
                  </Button>
                </div>
              )}
            </div>

            <TextArea
              id="topic"
              label="What do you want to say?"
              placeholder="e.g. I need to ask for an extension on my paper due Friday..."
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
            
            {/* Smart Context Detection */}
            <ContextDetector
              topic={topic}
              voices={voices}
              onVoiceSelect={(voiceId) => {
                const voice = voices.find(v => v.id === voiceId);
                if (voice) {
                  setSelectedVoice(voice);
                  setFilterVoiceId(voiceId);
                }
              }}
              selectedVoiceId={selectedVoice?.id}
            />

            <div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                isLoading={isGenerating}
                size="lg"
                className="shadow-lg"
              >
                Generate Email
              </Button>
            </div>
          </div>

          {response && (
            <div className="mt-8 border-t border-surface-200 dark:border-surface-700 pt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-surface-900 dark:text-surface-200">Generated Email</h3>
                {!editMode && (
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="outline"
                    size="sm"
                    icon={<span>✏️</span>}
                  >
                    Edit
                  </Button>
                )}
              </div>
              
              {autoSave && !editMode && (
                <div className="mb-4">
                  <div className="p-2 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-md text-xs text-success-700 dark:text-success-400">
                    This email has been automatically saved. You can find it in your saved emails below.
                  </div>
                </div>
              )}
              
              {editMode ? (
                <div className="space-y-4">
                  <TextArea
                    rows={10}
                    value={editedResponse}
                    onChange={(e) => setEditedResponse(e.target.value)}
                    className="font-mono"
                  />
                  
                  {/* Quick feedback buttons */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Quick adjustments:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleQuickRevision('too formal')}
                        variant="outline"
                        size="sm"
                      >
                        Too formal 🎩
                      </Button>
                      <Button
                        onClick={() => handleQuickRevision('too casual')}
                        variant="outline"
                        size="sm"
                      >
                        Too casual 😎
                      </Button>
                      <Button
                        onClick={() => handleQuickRevision('make shorter')}
                        variant="outline"
                        size="sm"
                      >
                        Make shorter ✂️
                      </Button>
                      <Button
                        onClick={() => handleQuickRevision('add details')}
                        variant="outline"
                        size="sm"
                      >
                        Add details 📝
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleSaveRevision}
                      variant="primary"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditMode(false);
                        setEditedResponse(response);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {!autoSave && (
                    <>
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
                      </div>
                    </>
                  )}
                </>
              )}
              
              {!editMode && (
                <div className="mt-4 flex space-x-3">
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
              )}
            </div>
          )}
        </Card>

        {/* Saved emails */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">Your Saved Emails</h2>
            
            <div className="max-w-xs">
              <Select
                id="filter-tone"
                label=""
                value={filterVoiceId}
                onChange={(e) => setFilterVoiceId(e.target.value)}
                options={[
                  { value: "all", label: "All Voices" },
                  ...voices.map(voice => ({ value: voice.id, label: voice.name }))
                ]}
              />
            </div>
          </div>
          
          {savedEmails.length === 0 ? (
            <Card className="text-center p-8 bg-surface-50 dark:bg-surface-800/50">
              <p className="text-surface-600 dark:text-surface-400">No saved emails yet. Generate your first one above.</p>
            </Card>
          ) : getFilteredEmails().length === 0 ? (
            <Card className="text-center p-8 bg-surface-50 dark:bg-surface-800/50">
              <p className="text-surface-600 dark:text-surface-400">No emails found with the selected voice. Try selecting a different voice or generate a new email.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              {getFilteredEmails().map((email) => (
                <Card key={email.id} className="overflow-hidden p-0 shadow-md hover:shadow-xl">
                  <div className="p-6">
                    {/* Email header */}
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div className="mb-2 mr-4">
                        <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                          Topic:
                        </span>
                        <h3 className="text-lg font-medium text-surface-900 dark:text-surface-200">
                          {email.originalTopic}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Show the tone used for this email */}
                        <Badge className="mr-2">
                          {voices.find(v => v.id === email.voiceId)?.name || "Unknown Tone"}
                        </Badge>
                        
                        {email.approved && (
                          <Badge variant="success">
                            ✅ Approved
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Original email */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-surface-700 mb-2">Email:</h4>
                      <EmailDisplay 
                        email={email.generatedEmail}
                        onCopy={(text) => copyToClipboard(text)}
                        onOpenInGmail={(text) => openInGmail(text)}
                        onDownload={(text) => downloadTextFile(`email-${email.id}.txt`, text)}
                        onEdit={(newContent) => handleEmailEdit(email.id, newContent)}
                        editable={true}
                        autoSave={autoSave}
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
                          onCopy={(text) => copyToClipboard(text)}
                          onOpenInGmail={(text) => openInGmail(text)}
                          onDownload={(text) => downloadTextFile(`revision-${email.id}.txt`, text)}
                          onEdit={(newContent) => handleRevisionEdit(email.id, newContent)}
                          editable={true}
                          autoSave={autoSave}
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
        </>
      )}
    </Layout>
  );
}