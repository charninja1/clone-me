import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "../components/Layout";

export default function SettingsPage() {
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [voices, setVoices] = useState([]);
  const [defaultVoiceId, setDefaultVoiceId] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
        loadSettings(user.uid);
        loadVoices(user.uid);
      }
    });
    return () => unsub();
  }, []);

  async function loadSettings(uid) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      setDefaultVoiceId(data.defaultVoiceId || "");
      setDarkMode(data.settings?.darkMode || false);
      setAutoSave(data.settings?.autoSave || false);
    }
  }

  async function loadVoices(uid) {
    const q = query(collection(db, "voices"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVoices(list);
  }

  async function handleSave() {
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      defaultVoiceId,
      settings: {
        darkMode,
        autoSave,
      },
    });

    setStatus("✅ Settings saved!");
    setTimeout(() => setStatus(""), 2000);
  }

  return (
    <Layout>
      <h1>Account Settings</h1>

      <p><strong>Email:</strong> {userEmail}</p>

      <div style={{ marginTop: "2rem" }}>
        <h3>Default Tone</h3>
        <select
          value={defaultVoiceId}
          onChange={(e) => setDefaultVoiceId(e.target.value)}
        >
          <option value="">-- None Selected --</option>
          {voices.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Preferences</h3>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          Enable dark mode (coming soon)
        </label>
        <label>
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
          />
          Auto-save after generation (coming soon)
        </label>
      </div>

      <button onClick={handleSave} style={{ marginTop: "2rem" }}>
        Save Settings
      </button>

      {status && <p style={{ color: "green", marginTop: "1rem" }}>{status}</p>}
    </Layout>
  );
}
