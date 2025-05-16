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
import { Layout, Card, Button, Select, Checkbox, AlertBanner } from "../components";
import ThemeSelector from "../components/ui/ThemeSelector";
import { useTheme, THEMES } from "../contexts/ThemeContext";

export default function SettingsPage() {
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [voices, setVoices] = useState([]);
  const [defaultVoiceId, setDefaultVoiceId] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [autoGmail, setAutoGmail] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setAutoCopy(data.settings?.autoCopy || false);
      setAutoGmail(data.settings?.autoGmail || false);
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
    
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        defaultVoiceId,
        settings: {
          darkMode,
          autoSave,
          autoCopy,
          autoGmail
        },
      });

      setStatus("✅ Settings saved!");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary-700 mb-0">Account Settings</h1>
            <div className="text-sm bg-surface-100 px-3 py-1 rounded-md">
              <span className="font-medium">Email:</span> {userEmail}
            </div>
          </div>

          <div className="space-y-8">
            {/* Default Tone */}
            <Card className="mb-8">
              <h3 className="text-lg font-medium text-surface-900 mb-4">Default Tone</h3>
              <p className="text-surface-600 mb-4">
                Select a default tone that will be automatically selected when generating new emails.
              </p>
              <div className="max-w-xs">
                <Select
                  id="default-tone"
                  value={defaultVoiceId}
                  onChange={(e) => setDefaultVoiceId(e.target.value)}
                  aria-label="Choose default tone"
                  options={voices.map(v => ({ value: v.id, label: v.name }))}
                  placeholder="-- None Selected --"
                />
              </div>
            </Card>

            {/* Preferences */}
            <Card>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Theme</h4>
                  <div className="mb-2">
                    <ThemeSelector />
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                    Choose between light mode, dark mode, or your system preference.  
                  </p>
                </div>

                <Checkbox
                  id="auto-save"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  label="Auto-save after generation"
                  description="Automatically save emails after they're generated."
                />

                <Checkbox
                  id="auto-copy"
                  checked={autoCopy}
                  onChange={(e) => setAutoCopy(e.target.checked)}
                  label="Auto-copy to clipboard"
                  description="Automatically copy generated emails to your clipboard."
                />

                <Checkbox
                  id="auto-gmail"
                  checked={autoGmail}
                  onChange={(e) => setAutoGmail(e.target.checked)}
                  label="Open in Gmail automatically"
                  description="Automatically open generated emails in Gmail."
                />
              </div>
            </Card>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              isLoading={isLoading}
            >
              Save Settings
            </Button>
            
            {status && (
              <AlertBanner
                type={status.includes('❌') ? 'error' : 'success'}
                message={status}
                className="ml-4 flex-1"
                onClose={() => setStatus("")}
              />
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}