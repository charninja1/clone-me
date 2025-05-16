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
import Layout from "../components/Layout";

export default function TonesPage() {
  const [tones, setTones] = useState([]);
  const [newName, setNewName] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [editingToneId, setEditingToneId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedInstructions, setEditedInstructions] = useState("");
  const [userId, setUserId] = useState(null);

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
    const snapshot = await getDocs(
      query(collection(db, "voices"), where("userId", "==", userId))
    );
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTones(list);
  }

  async function handleCreate() {
    if (!newName || !newInstructions) return;
    await addDoc(collection(db, "voices"), {
      userId,
      name: newName,
      instructions: newInstructions,
    });
    setNewName("");
    setNewInstructions("");
    fetchTones();
  }

  async function handleDelete(toneId) {
    const confirmed = confirm("Delete this tone?");
    if (!confirmed) return;
    await deleteDoc(doc(db, "voices", toneId));
    fetchTones();
  }

  function startEdit(tone) {
    setEditingToneId(tone.id);
    setEditedName(tone.name);
    setEditedInstructions(tone.instructions);
  }

  async function saveEdit(toneId) {
    await updateDoc(doc(db, "voices", toneId), {
      name: editedName,
      instructions: editedInstructions,
    });
    setEditingToneId(null);
    fetchTones();
  }
  
  function cancelEdit() {
    setEditingToneId(null);
    setEditedName("");
    setEditedInstructions("");
  }

  return (
    <Layout>
      <h1>Create a New Tone</h1>

      <input
        placeholder="Tone name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />

      <textarea
        placeholder="Instructions (e.g. Write confidently and casually)"
        value={newInstructions}
        onChange={(e) => setNewInstructions(e.target.value)}
        rows={4}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={handleCreate}>Create Tone</button>

      <h2 style={{ marginTop: "2rem" }}>Your Tones</h2>
      {tones.length === 0 && <p>No tones yet. Create your first one above.</p>}

      {tones.map((tone) => (
        <div
          key={tone.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            whiteSpace: "pre-wrap",
            position: "relative"
          }}
        >
          {editingToneId === tone.id ? (
            <>
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                style={{ width: "100%", marginBottom: "0.5rem" }}
              />
              <textarea
                value={editedInstructions}
                onChange={(e) => setEditedInstructions(e.target.value)}
                rows={3}
                style={{ width: "100%", marginBottom: "0.5rem" }}
              />
              <button onClick={() => saveEdit(tone.id)} style={{ marginRight: "0.5rem" }}>
                ✅ Save
              </button>
              <button onClick={cancelEdit}>❌ Cancel</button>
            </>
          ) : (
            <>
              <strong>{tone.name}</strong>
              <p>{tone.instructions}</p>
              <button onClick={() => startEdit(tone)} style={{ marginRight: "0.5rem" }}>
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(tone.id)}>🗑️ Delete</button>
            </>
          )}
        </div>
      ))}
    </Layout>
  );
}
