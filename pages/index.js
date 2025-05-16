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
import GenerationForm from "../components/GenerationForm";
import GeneratedEmailDisplay from "../components/GeneratedEmailDisplay";
import SavedEmailsList from "../components/SavedEmailsList";

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
  
  // Version history states
  const [showHistory, setShowHistory] = useState({});
  const [selectedVersion, setSelectedVersion] = useState({});
  
  // Email subject state
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [editedSubject, setEditedSubject] = useState("");
  
  // Keyboard shortcuts helper
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        initUser(user.uid);
      }
    });
    return () => unsubAuth();
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + Enter to generate
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating && topic && selectedVoice) {
          handleGenerate();
        }
      }
      
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (response && !autoSave) {
          handleSave();
        } else if (editMode) {
          handleSaveRevision();
        }
      }
      
      // Cmd/Ctrl + E to toggle edit mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        if (response) {
          if (editMode) {
            setEditMode(false);
            setEditedResponse(response);
            setEditedSubject(generatedSubject);
          } else {
            setEditMode(true);
            setEditedSubject(generatedSubject);
          }
        }
      }
      
      // ? to show shortcuts (only when not typing in an input)
      if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
      
      // Escape to close shortcuts
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
      
      // Cmd/Ctrl + C to copy email (when not in edit mode)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !editMode && response) {
        // Only if no text is selected
        if (!window.getSelection().toString()) {
          e.preventDefault();
          copyToClipboard(response);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isGenerating, topic, selectedVoice, response, autoSave, editMode, generatedSubject, showShortcuts]);
  
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
      setGeneratedSubject(data.subject || "");

      if (autoSave && data.result.trim()) {
        await addDoc(collection(db, "emails"), {
          userId,
          voiceId: selectedVoice.id,
          originalTopic: topic,
          generatedEmail: data.result,
          subject: data.subject || "",
          feedbackText: "",
          revision: "",
          approved: false,
          editedAt: new Date().toISOString(),
        });
        fetchEmails();
      }

      if (autoCopy) copyToClipboard(data.result);
      if (autoGmail) openInGmail(data.result, data.subject);
      
      // Initialize edited response and subject for edit mode
      setEditedResponse(data.result);
      setEditedSubject(data.subject || "");
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
      setGeneratedSubject(editedSubject);
      setEditMode(false);
      
      // Save to database if auto-save is enabled
      if (autoSave) {
        // Check if this is a revision of an existing email
        const existingEmail = savedEmails.find(email => 
          email.generatedEmail === response && email.originalTopic === topic
        );
        
        if (existingEmail) {
          // Update existing email with version history
          const versions = existingEmail.versions || [];
          versions.push({
            content: existingEmail.generatedEmail,
            subject: existingEmail.subject || generatedSubject,
            createdAt: existingEmail.editedAt || existingEmail.createdAt,
            type: 'original'
          });
          
          await updateDoc(doc(db, "emails", existingEmail.id), {
            generatedEmail: editedResponse,
            subject: editedSubject,
            versions: versions,
            editedAt: new Date().toISOString(),
            hasVersions: true
          });
        } else {
          // Create new email
          await addDoc(collection(db, "emails"), {
            userId,
            voiceId: selectedVoice.id,
            originalTopic: topic,
            generatedEmail: editedResponse,
            subject: editedSubject,
            feedbackText: "",
            revision: editedResponse,
            approved: false,
            editedAt: new Date().toISOString(),
            isRevision: true,
            versions: []
          });
        }
        
        fetchEmails();
      }
      
      // Copy to clipboard if auto-copy is enabled
      if (autoCopy) copyToClipboard(editedResponse);
    } catch (err) {
      setError("Error saving revision: " + err.message);
    }
  }
  
  async function handleRestoreVersion(emailId, versionContent) {
    try {
      const emailDoc = savedEmails.find(e => e.id === emailId);
      if (!emailDoc) return;
      
      // Save current version to history
      const versions = emailDoc.versions || [];
      versions.push({
        content: emailDoc.generatedEmail,
        createdAt: emailDoc.editedAt || emailDoc.createdAt,
        type: 'previous'
      });
      
      // Update the email with the restored version
      await updateDoc(doc(db, "emails", emailId), {
        generatedEmail: versionContent,
        versions: versions,
        editedAt: new Date().toISOString(),
        hasVersions: true
      });
      
      // Refresh the emails list
      fetchEmails();
      
      // Clear selected version view
      setSelectedVersion({ ...selectedVersion, [emailId]: null });
      
      // Show success message
      alert("Version restored successfully!");
    } catch (err) {
      setError("Error restoring version: " + err.message);
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
        versions: [],
        hasVersions: false
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

      // Save the revision with feedback and update version history
      const versions = email.versions || [];
      // Add current version to history before updating
      versions.push({
        content: email.generatedEmail,
        createdAt: email.editedAt || email.createdAt,
        type: 'before-revision'
      });
      
      await updateDoc(doc(db, "emails", email.id), {
        feedbackText: feedback,
        revision: data.result,
        generatedEmail: data.result, // Update the main email content
        revisionSavedAt: new Date().toISOString(),
        editedAt: new Date().toISOString(),
        versions: versions,
        hasVersions: true
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

  function openInGmail(text, subject = "") {
    // Try to extract subject from the topic or use a default
    const emailSubject = subject || topic || "Email";
    const encodedSubject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(text);
    const mailto = `mailto:?subject=${encodedSubject}&body=${body}`;
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
      
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <Button
                onClick={() => setShowShortcuts(false)}
                variant="outline"
                size="sm"
                icon={<span>✕</span>}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Generate Email</span>
                <kbd className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-800 rounded">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter
                </kbd>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Save Email</span>
                <kbd className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-800 rounded">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + S
                </kbd>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Toggle Edit Mode</span>
                <kbd className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-800 rounded">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + E
                </kbd>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Copy Email</span>
                <kbd className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-800 rounded">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + C
                </kbd>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Show Shortcuts</span>
                <kbd className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-800 rounded">?</kbd>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Close Dialog</span>
                <kbd className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-800 rounded">Esc</kbd>
              </div>
            </div>
            
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-4">
              Press ? anytime to see this menu
            </p>
          </Card>
        </div>
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
          <GenerationForm
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceSelect={setSelectedVoice}
            topic={topic}
            onTopicChange={setTopic}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            error={error}
            onErrorClose={() => setError("")}
            filterVoiceId={filterVoiceId}
            onFilterChange={setFilterVoiceId}
          />

          {/* Generated Email Display */}
          <GeneratedEmailDisplay
            response={response}
            generatedSubject={generatedSubject}
            editMode={editMode}
            editedResponse={editedResponse}
            editedSubject={editedSubject}
            onEditModeToggle={() => {
              if (editMode) {
                setEditMode(false);
                setEditedResponse(response);
                setEditedSubject(generatedSubject);
              } else {
                setEditMode(true);
                setEditedSubject(generatedSubject);
              }
            }}
            onSubjectChange={setEditedSubject}
            onResponseChange={setEditedResponse}
            onQuickRevision={handleQuickRevision}
            onSaveRevision={handleSaveRevision}
            onCancelEdit={() => {
              setEditMode(false);
              setEditedResponse(response);
              setEditedSubject(generatedSubject);
            }}
            onCopy={copyToClipboard}
            onOpenGmail={openInGmail}
            autoSave={autoSave}
            isGenerating={isGenerating}
          />

          {/* Saved emails */}
          <SavedEmailsList
            emails={savedEmails}
            voices={voices}
            filterVoiceId={filterVoiceId}
            onFilterChange={setFilterVoiceId}
            onRevise={handleRevise}
            onApprove={handleApprove}
            onEmailEdit={handleEmailEdit}
            onRevisionEdit={handleRevisionEdit}
            onCopy={copyToClipboard}
            onOpenGmail={openInGmail}
            onDownload={downloadTextFile}
            feedbacks={feedbacks}
            onFeedbackChange={(emailId, value) => setFeedbacks({ ...feedbacks, [emailId]: value })}
            loadingId={loadingId}
          />
        </div>
        </>
      )}
    </Layout>
  );
}