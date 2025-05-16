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

// Voice template definitions
const voiceTemplates = [
  {
    id: 'professional',
    name: 'Professional Emails',
    description: 'For business and formal communication',
    instructions: 'Write in a professional, clear, and concise manner. Use formal language and proper grammar. Be respectful and courteous. Avoid slang and overly casual expressions. Structure emails with clear paragraphs and logical flow.',
    example: 'Dear Mr. Johnson,\n\nI hope this email finds you well. I am writing to follow up on our meeting last Tuesday regarding the Q3 marketing strategy.\n\nAs discussed, I have prepared the preliminary analysis and would appreciate your feedback.\n\nBest regards,\n[Your name]'
  },
  {
    id: 'thank-you',
    name: 'Thank You Notes',
    description: 'Express gratitude and appreciation',
    instructions: 'Write warm, sincere thank you messages. Be specific about what you are grateful for. Express genuine appreciation. Keep the tone positive and heartfelt. Mention the impact of their help or gift.',
    example: 'Hi Sarah,\n\nI wanted to take a moment to thank you for your help with the presentation yesterday. Your insights on the market analysis were invaluable.\n\nThanks to your input, the client was thoroughly impressed!\n\nWarmly,\n[Your name]'
  },
  {
    id: 'casual',
    name: 'Casual Messages',
    description: 'Friendly, informal communication',
    instructions: 'Write in a relaxed, conversational tone. Use contractions and informal language. Be friendly and approachable. Keep it light and easy-going. Use everyday vocabulary.',
    example: 'Hey Mike!\n\nJust wanted to check in and see how things are going. It\'s been a while since we caught up.\n\nLet me know if you\'re free for coffee this week!\n\nCheers,\n[Your name]'
  },
  {
    id: 'meeting-request',
    name: 'Meeting Requests',
    description: 'Schedule meetings professionally',
    instructions: 'Be clear about the meeting purpose and agenda. Suggest specific times and be flexible. Include all necessary details (location, duration, attendees). Be respectful of their time. Provide context for the meeting.',
    example: 'Subject: Meeting Request - Project Timeline Discussion\n\nHi Team,\n\nI\'d like to schedule a meeting to discuss our project timeline and upcoming milestones.\n\nWould Thursday, March 15th at 2:00 PM work for everyone? We\'ll need about 30 minutes.\n\nPlease let me know if this time works or suggest alternatives.\n\nBest,\n[Your name]'
  },
  {
    id: 'follow-up',
    name: 'Follow-up Emails',
    description: 'Check in on previous conversations',
    instructions: 'Reference the previous interaction clearly. Be polite but persistent. Provide context and remind them of key points. Include a clear call to action. Keep it concise and to the point.',
    example: 'Hi Alex,\n\nI wanted to follow up on our conversation from last week about the website redesign project.\n\nHave you had a chance to review the proposal I sent?\n\nI\'d be happy to answer any questions you might have.\n\nLooking forward to hearing from you.\n\nBest regards,\n[Your name]'
  },
  {
    id: 'academic',
    name: 'Academic Emails',
    description: 'For professors and academic contexts',
    instructions: 'Use formal academic language. Be respectful and professional. Clearly state your purpose. Include relevant course information. Be concise but thorough. Show that you\'ve done your research.',
    example: 'Dear Professor Smith,\n\nI am a student in your Introduction to Psychology (PSY 101) class, Section 3.\n\nI have a question regarding the assignment due on Friday. Could you clarify the required format for citations?\n\nThank you for your time and assistance.\n\nSincerely,\n[Your name]\n[Student ID]'
  }
];

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
  
  function applyTemplate(templateId) {
    const template = voiceTemplates.find(t => t.id === templateId);
    if (template) {
      setNewName(template.name);
      setNewDescription(template.description);
      setNewInstructions(template.instructions);
      setNewExample(template.example);
      setSelectedTemplate(templateId);
    }
  }

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
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-surface-800 dark:text-surface-300">Start with a template (optional)</h3>
              {selectedTemplate && (
                <Button
                  onClick={() => {
                    setNewName('');
                    setNewDescription('');
                    setNewInstructions('');
                    setNewExample('');
                    setSelectedTemplate('');
                  }}
                  variant="outline"
                  size="xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
              💡 Create different voices for different purposes (e.g., "Thank You Emails", "Client Updates", "Professor Messages")
            </p>
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
                    <div className="p-6">
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
                    <div className="p-6">
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
                      
                      <div className="flex flex-wrap gap-3 mt-4">
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