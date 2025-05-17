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
import { 
  onAuthStateChanged, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider 
} from "firebase/auth";
import { Layout, Card, Button, Select, Checkbox, AlertBanner, Input } from "../components";
import ThemeSelector from "../components/ui/ThemeSelector";
import { useTheme, THEMES } from "../contexts/ThemeContext";
import { useAutoSave } from "../hooks/useAutoSave";
import { useSaving } from "../contexts/SavingContext";

export default function SettingsPage() {
  const { startSaving, savingSuccess, savingError } = useSaving('settings');
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [voices, setVoices] = useState([]);
  const [defaultVoiceId, setDefaultVoiceId] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [autoGmail, setAutoGmail] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setDarkMode(data.settings?.darkMode || false);
      setAutoSave(data.settings?.autoSave || false);
      setAutoCopy(data.settings?.autoCopy || false);
      setAutoGmail(data.settings?.autoGmail || false);
    }
    setHasLoadedInitialData(true);
  }

  async function loadVoices(uid) {
    const q = query(collection(db, "voices"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVoices(list);
  }

  async function handleSave(settingsData) {
    const dataToSave = settingsData || {
      firstName,
      lastName,
      defaultVoiceId,
      settings: {
        darkMode,
        autoSave,
        autoCopy,
        autoGmail
      },
    };
    
    if (!userId) return;
    
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, dataToSave);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  }

  // Create settings data object for auto-save
  const settingsData = {
    firstName,
    lastName,
    defaultVoiceId,
    settings: {
      darkMode,
      autoSave,
      autoCopy,
      autoGmail
    },
  };

  // Use auto-save hook
  const { isDirty, lastSaved, saveNow, SavingIndicator } = useAutoSave({
    data: settingsData,
    onSave: handleSave,
    enabled: hasLoadedInitialData && userId,
    delay: 1500,
  });

  // Manual save function
  async function handleManualSave() {
    setIsLoading(true);
    try {
      await saveNow();
      setStatus("✅ Settings saved!");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordError("");
    
    // Input validation
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to change your password");
      }
      
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Clear form and show success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus("✅ Password changed successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      // Handle specific auth errors
      if (error.code === 'auth/wrong-password') {
        setPasswordError("Current password is incorrect");
      } else if (error.code === 'auth/weak-password') {
        setPasswordError("New password is too weak");
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordError("Please log out and log back in to change your password");
      } else {
        setPasswordError(error.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold mb-0">Account Settings</h1>
            <div className="text-sm bg-surface-100 dark:bg-surface-700 px-3 py-1 rounded-md">
              <span className="font-medium">Email:</span> {userEmail}
            </div>
          </div>

          <div className="space-y-8">
            {/* Personal Information */}
            <Card className="mb-8 bg-surface-50 dark:bg-surface-800">
              <h3 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-surface-900 to-surface-700 dark:from-white dark:to-surface-300">Personal Information</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Your name will be used to personalize the generated emails.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <Input
                  id="first-name"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  autoComplete="given-name"
                />
                <Input
                  id="last-name"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
            </Card>

            {/* Default Voice */}
            <Card className="mb-8 bg-surface-50 dark:bg-surface-800">
              <h3 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-surface-900 to-surface-700 dark:from-white dark:to-surface-300">Default Voice</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Select a default voice that will be automatically selected when generating new emails.
              </p>
              <div className="max-w-xs">
                <Select
                  id="default-voice"
                  value={defaultVoiceId}
                  onChange={(e) => setDefaultVoiceId(e.target.value)}
                  aria-label="Choose default voice"
                  options={voices.map(v => ({ value: v.id, label: v.name }))}
                  placeholder="-- None Selected --"
                />
              </div>
            </Card>
            
            {/* Change Password */}
            <Card className="mb-8 bg-surface-50 dark:bg-surface-800">
              <h3 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-surface-900 to-surface-700 dark:from-white dark:to-surface-300">Change Password</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Update your account password. You'll need to enter your current password for verification.
              </p>
              
              <form onSubmit={handlePasswordChange} className="mt-4 max-w-md">
                <div className="space-y-4">
                  <Input
                    id="current-password"
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  
                  <Input
                    id="new-password"
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    helpText="Password must be at least 8 characters"
                    required
                  />
                  
                  <Input
                    id="confirm-password"
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  
                  {passwordError && (
                    <div className="text-error-600 dark:text-error-400 text-sm mt-2">
                      {passwordError}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="secondary"
                      isLoading={passwordLoading}
                      disabled={passwordLoading}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {/* Preferences */}
            <Card className="bg-surface-50 dark:bg-surface-800">
              <h3 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-surface-900 to-surface-700 dark:from-white dark:to-surface-300">Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Theme</h4>
                  <div className="mb-2">
                    <ThemeSelector showLabel={true} />
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
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleManualSave} 
                disabled={isLoading || !isDirty}
                isLoading={isLoading}
              >
                Save Settings
              </Button>
              {isDirty && (
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Unsaved changes
                </span>
              )}
              <SavingIndicator position="bottom-left" />
            </div>
            
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