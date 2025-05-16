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
import { Layout, Card, Button, Input, TextArea, AlertBanner } from "../components";

export default function TonesPage() {
  const [tones, setTones] = useState([]);
  const [newName, setNewName] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingToneId, setEditingToneId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedInstructions, setEditedInstructions] = useState("");
  const [editedExample, setEditedExample] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
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
    if (userId) fetchTones();
  }, [userId]);

  async function fetchTones() {
    try {
      const snapshot = await getDocs(
        query(collection(db, "voices"), where("userId", "==", userId))
      );
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTones(list);
    } catch (err) {
      setError("Failed to load tones: " + err.message);
    }
  }

  // Predefined tone templates
  const toneTemplates = [
    {
      id: "professional",
      name: "Professional",
      description: "Formal and precise business communication",
      instructions: "Write in a formal, professional tone. Use industry-specific terminology appropriately. Be clear, concise, and direct. Avoid casual language, slang, or humor. Maintain a respectful and somewhat formal distance. Structure the email with clear paragraphs and precise language.",
      example: "I'm writing to follow up on our discussion regarding the Q3 marketing strategy. Based on our analysis, I believe we should reallocate resources to digital channels where we're seeing higher engagement rates."
    },
    {
      id: "friendly",
      name: "Friendly",
      description: "Warm and personable communication",
      instructions: "Write in a warm, friendly, and approachable tone. Use conversational language while remaining professional. Include some personal touches or warm greetings where appropriate. Be positive and encouraging. Use contractions and occasional informal phrases to sound natural and approachable.",
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
      instructions: "Write in a scholarly, analytical tone suitable for academic contexts. Use field-appropriate terminology and references. Structure arguments logically with evidence-based reasoning. Maintain an objective, balanced perspective. Use passive voice where appropriate for academic distance. Cite sources or concepts when relevant.",
      example: "My analysis of the primary texts reveals a recurring theme of displacement that appears to contradict Smith's (2018) interpretation. This finding may contribute to the ongoing scholarly debate regarding the author's intended social commentary."
    },
    {
      id: "casual",
      name: "Casual",
      description: "Relaxed and conversational communication",
      instructions: "Write in a relaxed, conversational style like you're talking to a friend or close colleague. Use contractions, simpler sentence structures, and everyday language. Include some personality and humor where appropriate. Be direct and get to the point quickly, while still maintaining a light tone. Use active voice and first-person pronouns.",
      example: "Hey there! Just wanted to give you a quick update on the project. Things are moving along nicely, and I think we'll definitely hit our deadline. Let me know if you need anything from my end!"
    }
  ];

  // Apply selected template to form
  const applyTemplate = (templateId) => {
    const template = toneTemplates.find(t => t.id === templateId);
    if (template) {
      setNewName(template.name);
      setNewInstructions(template.instructions);
      setNewExample(template.example);
      setNewDescription(template.description);
      setSelectedTemplate(templateId);
    }
  };

  // Create a new tone
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
        createdAt: new Date().toISOString()
      });
      setNewName("");
      setNewInstructions("");
      setNewExample("");
      setNewDescription("");
      setSelectedTemplate("");
      fetchTones();
    } catch (err) {
      setError("Error creating tone: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(toneId) {
    try {
      const confirmed = window.confirm("Delete this tone?");
      if (!confirmed) return;
      
      await deleteDoc(doc(db, "voices", toneId));
      fetchTones();
    } catch (err) {
      setError("Error deleting tone: " + err.message);
    }
  }

  function startEdit(tone) {
    setEditingToneId(tone.id);
    setEditedName(tone.name);
    setEditedInstructions(tone.instructions || "");
    setEditedExample(tone.example || "");
    setEditedDescription(tone.description || "");
  }

  async function saveEdit(toneId) {
    if (!editedName || !editedInstructions) {
      setError("Please fill in at least the name and instructions fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await updateDoc(doc(db, "voices", toneId), {
        name: editedName,
        instructions: editedInstructions,
        example: editedExample,
        description: editedDescription,
        updatedAt: new Date().toISOString()
      });
      setEditingToneId(null);
      fetchTones();
    } catch (err) {
      setError("Error updating tone: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }
  
  function cancelEdit() {
    setEditingToneId(null);
    setEditedName("");
    setEditedInstructions("");
    setEditedExample("");
    setEditedDescription("");
    setError("");
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary-700 mb-8">Email Tones</h1>

        {/* Create New Tone Form */}
        <Card className="mb-10">
          <h2 className="text-xl font-semibold text-surface-800 mb-4">Create a New Tone</h2>
          
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
              {toneTemplates.map(template => (
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
                id="tone-name"
                label="Tone Name"
                type="text"
                placeholder="e.g. Professional, Casual, Friendly..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              
              <TextArea
                id="tone-description"
                label="Description"
                placeholder="Brief description of this writing style"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
              
              <TextArea
                id="tone-instructions"
                label="Instructions"
                placeholder="e.g. Write in a professional tone with clear and concise language..."
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                rows={4}
                required
                helpText="These instructions will be sent to the AI to guide the writing style. Be specific about language, structure, and tone."
              />
              
              <TextArea
                id="tone-example"
                label="Example Text (Optional)"
                placeholder="Example of this tone for reference..."
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
                  Create Tone
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Tone List */}
        <div>
          <h2 className="text-xl font-semibold text-surface-800 mb-4">Your Tones</h2>
          
          {tones.length === 0 ? (
            <Card className="text-center p-8">
              <p className="text-surface-600">No tones yet. Create your first one above.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {tones.map((tone) => (
                <Card
                  key={tone.id}
                  className="overflow-hidden p-0"
                >
                  {editingToneId === tone.id ? (
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-surface-900 mb-3">Edit Tone</h3>
                      <div className="space-y-4">
                        <Input
                          label="Tone Name"
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
                            onClick={() => saveEdit(tone.id)}
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
                      <h3 className="text-lg font-medium text-surface-900 mb-1">{tone.name}</h3>
                      
                      {tone.description && (
                        <p className="text-surface-500 dark:text-surface-400 text-sm mb-3">{tone.description}</p>
                      )}
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-surface-800 dark:text-surface-300 mb-1">Instructions:</h4>
                        <p className="text-surface-600 dark:text-surface-400 text-sm mb-3 whitespace-pre-wrap">{tone.instructions}</p>
                      </div>
                      
                      {tone.example && (
                        <div className="mb-4 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-md border border-surface-200 dark:border-surface-700">
                          <h4 className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Example:</h4>
                          <p className="text-surface-600 dark:text-surface-300 text-sm italic">{tone.example}</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => startEdit(tone)}
                          variant="outline"
                          size="xs"
                          icon={<span>✏️</span>}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(tone.id)}
                          variant="danger"
                          size="xs"
                          icon={<span>🗑️</span>}
                        >
                          Delete
                        </Button>
                      </div>
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