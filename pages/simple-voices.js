import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Layout, Card, Button, Badge } from "../components";
import SimpleVoiceCreator from "../components/SimpleVoiceCreator";
import HelpTooltip from "../components/HelpTooltip";
import VoicesList from "../components/VoicesList";

export default function SimpleVoices() {
  const [voices, setVoices] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [editingVoice, setEditingVoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchVoices(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const fetchVoices = (uid) => {
    const q = query(collection(db, "voices"), where("userId", "==", uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const voicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVoices(voicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const deleteVoice = async (voiceId) => {
    if (confirm("Are you sure you want to delete this voice?")) {
      try {
        await deleteDoc(doc(db, "voices", voiceId));
      } catch (error) {
        console.error("Error deleting voice:", error);
      }
    }
  };

  if (!userId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p>Please log in to manage your voices.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Email Voices</h1>
          <p className="text-lg text-surface-600 dark:text-surface-400">
            Create different voices for different situations
          </p>
        </div>

        {/* Voice Creator Modal */}
        {showCreator && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <SimpleVoiceCreator
                onComplete={() => {
                  setShowCreator(false);
                  setEditingVoice(null);
                }}
                editingVoice={editingVoice}
              />
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => {
                  setShowCreator(false);
                  setEditingVoice(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Your Voices 
              {!loading && <span className="text-surface-600">({voices.length})</span>}
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mt-1">
              Create different voices for various writing styles
            </p>
          </div>
          {voices.length > 0 && (
            <Button 
              onClick={() => setShowCreator(true)}
              className="hover:scale-105 transition-transform"
            >
              Add New Voice
            </Button>
          )}
        </div>

        {/* Voices List */}
        <VoicesList
          voices={voices}
          isLoading={loading}
          onEdit={(voice) => {
            setEditingVoice(voice);
            setShowCreator(true);
          }}
          onDelete={deleteVoice}
          onTrain={(voiceId) => window.location.href = '/'}
        />
        
        {voices.length === 0 && !loading && (
          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={() => setShowCreator(true)}
              className="hover:scale-105 transition-transform animate-pulse"
            >
              Create Your First Voice
            </Button>
          </div>
        )}

        {/* Help Section */}
        {voices.length > 0 && (
          <Card className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-3">💡 Voice Training Tips</h3>
            <ul className="space-y-2 text-sm text-surface-700 dark:text-surface-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Use a voice at least 10 times to reach "Advanced" level</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Provide feedback on generated emails to improve accuracy</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Upload sample emails to train the voice faster</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Create separate voices for work, school, and personal emails</span>
              </li>
            </ul>
          </Card>
        )}
      </div>
    </Layout>
  );
}