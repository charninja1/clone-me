import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Layout, Card, Button, Input, TextArea, AlertBanner, Badge } from "../components";
import VoiceOnboardingWizard from "../components/VoiceOnboardingWizard";
import VoiceCalibration from "../components/VoiceCalibration";
import FeedbackMemoryVisualization from "../components/FeedbackMemoryVisualization";

export default function VoicesPage() {
  const [voices, setVoices] = useState([]);
  const [newName, setNewName] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingVoiceId, setEditingVoiceId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedInstructions, setEditedInstructions] = useState("");
  const [editedExample, setEditedExample] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [viewFeedbackVoiceId, setViewFeedbackVoiceId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [calibratingVoiceId, setCalibratingVoiceId] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards, onboarding, calibration
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) fetchVoices();
  }, [userId]);

  async function fetchVoices() {
    try {
      const snapshot = await getDocs(
        query(collection(db, "voices"), where("userId", "==", userId))
      );
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVoices(list);
    } catch (err) {
      setError("Failed to load voices: " + err.message);
    }
  }

  // Predefined voice templates
  const voiceTemplates = [
    {
      id: "professional",
      name: "Professional",
      description: "Formal and precise business communication",
      instructions: "Write in a formal, professional voice. Use industry-specific terminology appropriately. Be clear, concise, and direct. Avoid casual language, slang, or humor. Maintain a respectful and somewhat formal distance. Structure the email with clear paragraphs and precise language.",
      example: "I'm writing to follow up on our discussion regarding the Q3 marketing strategy. Based on our analysis, I believe we should reallocate resources to digital channels where we're seeing higher engagement rates."
    },
    {
      id: "friendly",
      name: "Friendly",
      description: "Warm and personable communication",
      instructions: "Write in a warm, friendly, and approachable voice. Use conversational language while remaining professional. Include some personal touches or warm greetings where appropriate. Be positive and encouraging. Use contractions and occasional informal phrases to sound natural and approachable.",
      example: "Hope you're doing well! I wanted to check in about the project timeline we discussed last week. I've been making good progress on my end and was wondering how things are going with your part."
    },
    {
      id: "persuasive",
      name: "Persuasive",
      description: "Compelling and convincing communication",
      instructions: "Write in a persuasive and compelling manner. Use confident language and strong arguments. Present facts and evidence to support your points. Create a sense of urgency when appropriate. Use rhetorical questions and storytelling techniques to engage the reader. End with a clear call to action.",
      example: "Did you know that 73% of customers abandon their shopping carts due to poor website experience? Our solution has helped similar businesses increase conversions by 45% in just three months. Let's schedule a demo to show you how we can transform your online sales."
    },
    {
      id: "academic",
      name: "Academic",
      description: "Scholarly and research-oriented communication",
      instructions: "Write in a scholarly, analytical voice suitable for academic contexts. Use field-appropriate terminology and references. Structure arguments logically with evidence-based reasoning. Maintain an objective, balanced perspective. Use passive voice where appropriate for academic distance. Cite sources or concepts when relevant.",
      example: "My analysis of the primary texts reveals a recurring theme of displacement that appears to contradict Smith's (2018) interpretation. This finding may contribute to the ongoing scholarly debate regarding the author's intended social commentary."
    },
    {
      id: "casual",
      name: "Casual",
      description: "Relaxed and conversational communication",
      instructions: "Write in a relaxed, conversational style like you're talking to a friend or close colleague. Use contractions, simpler sentence structures, and everyday language. Include some personality and humor where appropriate. Be direct and get to the point quickly, while still maintaining a light voice. Use active voice and first-person pronouns.",
      example: "Hey there! Just wanted to give you a quick update on the project. Things are moving along nicely, and I think we'll definitely hit our deadline. Let me know if you need anything from my end!"
    }
  ];

  // Apply selected template to form
  const applyTemplate = (templateId) => {
    const template = voiceTemplates.find(t => t.id === templateId);
    if (template) {
      setNewName(template.name);
      setNewInstructions(template.instructions);
      setNewExample(template.example);
      setNewDescription(template.description);
      setSelectedTemplate(templateId);
    }
  };

  // Create a new voice
  async function handleCreate(e) {
    e.preventDefault();
    if (!newName || !newInstructions) {
      setError("Please fill in at least the name and instructions fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await addDoc(collection(db, "voices"), {
        userId,
        name: newName,
        instructions: newInstructions,
        example: newExample,
        description: newDescription,
        feedbackMemory: [], // Array to store feedback history
        createdAt: new Date().toISOString()
      });
      setNewName("");
      setNewInstructions("");
      setNewExample("");
      setNewDescription("");
      setSelectedTemplate("");
      fetchVoices();
    } catch (err) {
      setError("Error creating voice: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(voiceId) {
    try {
      const confirmed = window.confirm("Delete this voice?");
      if (!confirmed) return;
      
      await deleteDoc(doc(db, "voices", voiceId));
      fetchVoices();
    } catch (err) {
      setError("Error deleting voice: " + err.message);
    }
  }

  function startEdit(voice) {
    setEditingVoiceId(voice.id);
    setEditedName(voice.name);
    setEditedInstructions(voice.instructions || "");
    setEditedExample(voice.example || "");
    setEditedDescription(voice.description || "");
  }

  async function saveEdit(voiceId) {
    if (!editedName || !editedInstructions) {
      setError("Please fill in at least the name and instructions fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await updateDoc(doc(db, "voices", voiceId), {
        name: editedName,
        instructions: editedInstructions,
        example: editedExample,
        description: editedDescription,
        updatedAt: new Date().toISOString()
      });
      setEditingVoiceId(null);
      fetchVoices();
    } catch (err) {
      setError("Error updating voice: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }
  
  function cancelEdit() {
    setEditingVoiceId(null);
    setEditedName("");
    setEditedInstructions("");
    setEditedExample("");
    setEditedDescription("");
    setError("");
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary-700">Email Voices</h1>
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode('cards')}
              className={viewMode === 'cards' ? 'ring-2 ring-primary-500' : ''}
            >
              My Voices
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowOnboarding(true)}
            >
              Create New Voice
            </Button>
          </div>
        </div>

        {/* Onboarding Wizard */}
        {showOnboarding && (
          <VoiceOnboardingWizard
            onComplete={() => {
              setShowOnboarding(false);
              fetchVoices();
            }}
            onCancel={() => setShowOnboarding(false)}
          />
        )}
        
        {/* Calibration Mode */}
        {calibratingVoiceId && (
          <VoiceCalibration
            voice={voices.find(v => v.id === calibratingVoiceId)}
            onComplete={() => {
              setCalibratingVoiceId(null);
              fetchVoices();
            }}
          />
        )}
        
        {/* Create New Voice Form - only show if not in onboarding */}
        {!showOnboarding && !calibratingVoiceId && (
          <Card className="mb-10">
            <h2 className="text-xl font-semibold text-surface-800 dark:text-surface-200 mb-4">Quick Create</h2>
          
          {error && (
            <AlertBanner
              type="error"
              message={error}
              className="mb-4"
              onClose={() => setError("")}
            />
          )}
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-surface-800 dark:text-surface-300 mb-2">Start with a template</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {voiceTemplates.map(template => (
                <div 
                  key={template.id}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    selectedTemplate === template.id 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-700' 
                      : 'border-surface-200 hover:border-primary-300 dark:border-surface-700 dark:hover:border-primary-800'
                  }`}
                  onClick={() => applyTemplate(template.id)}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <Input
                id="voice-name"
                label="Voice Name"
                type="text"
                placeholder="e.g. Professional, Casual, Friendly..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              
              <TextArea
                id="voice-description"
                label="Description"
                placeholder="Brief description of this writing style"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
              
              <TextArea
                id="voice-instructions"
                label="Instructions"
                placeholder="e.g. Write in a professional voice with clear and concise language..."
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                rows={4}
                required
                helpText="These instructions will be sent to the AI to guide the writing style. Be specific about language, structure, and voice."
              />
              
              <TextArea
                id="voice-example"
                label="Example Text (Optional)"
                placeholder="Example of this voice for reference..."
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                rows={3}
              />
              
              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Create Voice
                </Button>
              </div>
            </div>
          </form>
        </Card>
        )}

        {/* Voice List */}
        <div>
          <h2 className="text-xl font-semibold text-surface-800 mb-4">Your Voices</h2>
          
          {voices.length === 0 ? (
            <Card className="text-center p-8">
              <p className="text-surface-600">No voices yet. Create your first one above.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {voices.map((voice) => (
                <Card
                  key={voice.id}
                  className="overflow-hidden p-0"
                >
                  {editingVoiceId === voice.id ? (
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-surface-900 mb-3">Edit Voice</h3>
                      <div className="space-y-4">
                        <Input
                          label="Voice Name"
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          required
                        />
                        
                        <TextArea
                          label="Description"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          rows={2}
                        />
                        
                        <TextArea
                          label="Instructions"
                          value={editedInstructions}
                          onChange={(e) => setEditedInstructions(e.target.value)}
                          rows={4}
                          required
                          helpText="These instructions will be sent to the AI to guide the writing style."
                        />
                        
                        <TextArea
                          label="Example Text"
                          value={editedExample}
                          onChange={(e) => setEditedExample(e.target.value)}
                          rows={3}
                        />
                        
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => saveEdit(voice.id)}
                            size="sm"
                            disabled={isLoading}
                            isLoading={isLoading}
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-surface-900 mb-1">{voice.name}</h3>
                      
                      {voice.description && (
                        <p className="text-surface-500 dark:text-surface-400 text-sm mb-3">{voice.description}</p>
                      )}
                      
                      {/* Training Status */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Training Status</span>
                          <Badge variant={voice.trainingLevel === 'expert' ? 'success' : 'primary'}>
                            {voice.trainingLevel || 'Beginner'}
                          </Badge>
                        </div>
                        <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((voice.feedbackMemory?.length || 0) / 20) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-surface-500 mt-1">
                          {voice.feedbackMemory?.length || 0} feedback sessions
                        </p>
                      </div>
                      
                      {voice.example && (
                        <div className="mb-4 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-md border border-surface-200 dark:border-surface-700">
                          <h4 className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Example:</h4>
                          <p className="text-surface-600 dark:text-surface-300 text-sm italic">{voice.example}</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => startEdit(voice)}
                          variant="outline"
                          size="xs"
                          icon={<span>✏️</span>}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => setCalibratingVoiceId(voice.id)}
                          variant="secondary"
                          size="xs"
                          icon={<span>🎯</span>}
                        >
                          Calibrate
                        </Button>
                        <Button
                          onClick={() => setViewFeedbackVoiceId(viewFeedbackVoiceId === voice.id ? null : voice.id)}
                          variant="outline"
                          size="xs"
                          icon={<span>📊</span>}
                        >
                          {viewFeedbackVoiceId === voice.id ? 'Hide Analysis' : 'Analysis'}
                        </Button>
                        <Button
                          onClick={() => handleDelete(voice.id)}
                          variant="danger"
                          size="xs"
                          icon={<span>🗑️</span>}
                        >
                          Delete
                        </Button>
                      </div>
                      
                      {viewFeedbackVoiceId === voice.id && (
                        <div className="mt-4">
                          <FeedbackMemoryVisualization 
                            voice={voice}
                            feedbackHistory={voice.feedbackMemory || []}
                          />
                        </div>
                      )}
                      
                      {/* Quick Training Tips */}
                      {(!voice.feedbackMemory || voice.feedbackMemory.length < 5) && (
                        <Card className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20">
                          <p className="text-sm text-primary-800 dark:text-primary-200">
                            💡 <strong>Tip:</strong> Use the Calibrate button to train this voice with your writing style!
                          </p>
                        </Card>
                      )}
                      
                      {false && voice.feedbackMemory && voice.feedbackMemory.length > 0 ? (
                            <div className="space-y-3">
                              {voice.feedbackMemory.slice().reverse().map((item, index) => (
                                <div key={index} className="text-sm border-b border-surface-200 dark:border-surface-700 pb-3">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium text-primary-600 dark:text-primary-400">Feedback:</span>
                                    <span className="text-surface-500 dark:text-surface-400 text-xs">
                                      {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-surface-700 dark:text-surface-300 italic mb-2">&ldquo;{item.feedback}&rdquo;</p>
                                  <div className="text-xs text-surface-500 dark:text-surface-400">
                                    <div className="mb-1">
                                      <strong>Original:</strong> {item.originalEmail}...
                                    </div>
                                    <div>
                                      <strong>Revised:</strong> {item.revision}...
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}