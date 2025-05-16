import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import HelpTooltip from './HelpTooltip';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const SimpleDashboard = ({ userId }) => {
  const [voices, setVoices] = useState([]);
  const [emailCount, setEmailCount] = useState(0);
  const [isNewUser, setIsNewUser] = useState(true);
  
  useEffect(() => {
    if (!userId) return;
    
    // Fetch user's voices
    const voicesQuery = query(collection(db, 'voices'), where('userId', '==', userId));
    const unsubscribeVoices = onSnapshot(voicesQuery, (snapshot) => {
      const voicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVoices(voicesData);
      setIsNewUser(voicesData.length === 0);
    });
    
    // Fetch email count
    const emailsQuery = query(collection(db, 'emails'), where('userId', '==', userId));
    const unsubscribeEmails = onSnapshot(emailsQuery, (snapshot) => {
      setEmailCount(snapshot.docs.length);
    });
    
    return () => {
      unsubscribeVoices();
      unsubscribeEmails();
    };
  }, [userId]);
  
  if (isNewUser) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👋</div>
        <h2 className="text-3xl font-bold mb-3">Welcome to CloneMe!</h2>
        <p className="text-xl text-surface-600 dark:text-surface-400 mb-6">
          Let's get you started with your first email voice
        </p>
        
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-left">
            <h3 className="text-lg font-semibold mb-3">Quick Start Guide</h3>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">1</span>
                <div>
                  <p className="font-medium">Create a Voice</p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Choose a template that matches how you want to write
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">2</span>
                <div>
                  <p className="font-medium">Write Your First Email</p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Tell me what you want to say, and I'll write it for you
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">3</span>
                <div>
                  <p className="font-medium">Make It Perfect</p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Tell me what to change, and I'll learn your style
                  </p>
                </div>
              </li>
            </ol>
            
            <Button
              className="w-full mt-6"
              onClick={() => window.location.href = '/voices'}
            >
              Create Your First Voice →
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Your Voices</p>
              <p className="text-2xl font-bold">{voices.length}</p>
            </div>
            <div className="text-3xl">🎭</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Emails Written</p>
              <p className="text-2xl font-bold">{emailCount}</p>
            </div>
            <div className="text-3xl">✉️</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Time Saved</p>
              <p className="text-2xl font-bold">{Math.round(emailCount * 5)} min</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          <HelpTooltip content="These are your most common tasks">
            Quick Actions
          </HelpTooltip>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4"
            onClick={() => window.location.href = '/'}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">✍️</div>
              <div>Write an Email</div>
              <div className="text-xs text-surface-500 mt-1">Generate a new email</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4"
            onClick={() => window.location.href = '/voices'}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div>Train a Voice</div>
              <div className="text-xs text-surface-500 mt-1">Improve your voices</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4"
            onClick={() => window.location.href = '/voices'}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">➕</div>
              <div>Add New Voice</div>
              <div className="text-xs text-surface-500 mt-1">Create another voice</div>
            </div>
          </Button>
        </div>
      </Card>
      
      {/* Your Voices */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          <HelpTooltip content="These are your different writing styles">
            Your Voices
          </HelpTooltip>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {voices.map(voice => (
            <div
              key={voice.id}
              className="border border-surface-200 dark:border-surface-700 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
              onClick={() => window.location.href = '/'}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{voice.name}</h4>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                    {voice.description || 'No description'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                      {voice.trainingLevel || 'Beginner'}
                    </span>
                    <span className="text-xs text-surface-500">
                      {voice.feedbackMemory?.length || 0} training sessions
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/voices';
                  }}
                >
                  Train
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SimpleDashboard;