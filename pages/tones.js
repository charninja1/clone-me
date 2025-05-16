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
  const [editingToneId, setEditingToneId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedInstructions, setEditedInstructions] = useState("");
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

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName || !newInstructions) {
      setError("Please fill in both fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await addDoc(collection(db, "voices"), {
        userId,
        name: newName,
        instructions: newInstructions,
      });
      setNewName("");
      setNewInstructions("");
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
    setEditedInstructions(tone.instructions);
  }

  async function saveEdit(toneId) {
    if (!editedName || !editedInstructions) {
      setError("Please fill in both fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await updateDoc(doc(db, "voices", toneId), {
        name: editedName,
        instructions: editedInstructions,
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
                id="tone-instructions"
                label="Instructions"
                placeholder="e.g. Write in a professional tone with clear and concise language..."
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                rows={4}
                required
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
                          label="Instructions"
                          value={editedInstructions}
                          onChange={(e) => setEditedInstructions(e.target.value)}
                          rows={4}
                          required
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
                      <h3 className="text-lg font-medium text-surface-900 mb-2">{tone.name}</h3>
                      <p className="text-surface-600 text-sm mb-4 whitespace-pre-wrap">{tone.instructions}</p>
                      
                      <div className="flex space-x-2">
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