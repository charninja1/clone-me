import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Layout, Card, Button, Badge } from "../components";
import SimpleVoiceCreator from "../components/SimpleVoiceCreator";
import HelpTooltip from "../components/HelpTooltip";

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

        {/* Voices List */}
        {loading ? (
          <div className="text-center py-12">
            <p>Loading your voices...</p>
          </div>
        ) : voices.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-bold mb-3">No Voices Yet</h2>
            <p className="text-lg text-surface-600 dark:text-surface-400 mb-6">
              Create your first voice to start writing emails
            </p>
            <Button
              size="lg"
              onClick={() => setShowCreator(true)}
            >
              Create Your First Voice
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <HelpTooltip content="You can have multiple voices for different writing styles">
                <h2 className="text-xl font-semibold">Your Voices ({voices.length})</h2>
              </HelpTooltip>
              <Button onClick={() => setShowCreator(true)}>
                Add New Voice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {voices.map((voice) => (
                <Card key={voice.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{voice.name}</h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                        {voice.description || "No description"}
                      </p>
                    </div>
                    <Badge variant={voice.trainingLevel === 'expert' ? 'success' : 'primary'}>
                      {voice.trainingLevel || 'Beginner'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                      <p className="text-2xl font-bold">{voice.feedbackMemory?.length || 0}</p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">Training Sessions</p>
                    </div>
                    <div className="text-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                      <p className="text-2xl font-bold">{voice.sampleEmails?.length || 0}</p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">Email Samples</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = '/'}
                    >
                      Use This Voice
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingVoice(voice);
                        setShowCreator(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVoice(voice.id)}
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Training Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-surface-600 dark:text-surface-400">Training Progress</span>
                      <span className="text-xs text-surface-600 dark:text-surface-400">
                        {Math.min(100, (voice.feedbackMemory?.length || 0) * 5)}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (voice.feedbackMemory?.length || 0) * 5)}%` }}
                      />
                    </div>
                    <p className="text-xs text-surface-500 mt-1">
                      {voice.feedbackMemory?.length || 0} / 20 sessions to expert level
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Help Section */}
            <Card className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20">
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
          </>
        )}
      </div>
    </Layout>
  );
}