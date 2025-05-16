import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SimpleOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  
  const steps = [
    {
      title: "👋 Welcome to CloneMe!",
      content: (
        <div className="space-y-4">
          <p className="text-lg">I'll help you write emails that sound exactly like you!</p>
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <p className="text-sm">Think of me as your personal email assistant who learns how YOU write.</p>
          </div>
          <div className="text-center">
            <p className="text-xl mb-2">What should I call you?</p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your first name"
              className="px-4 py-2 border rounded-lg text-center text-lg"
              autoFocus
            />
          </div>
        </div>
      ),
      canProceed: userName.trim().length > 0
    },
    {
      title: `Nice to meet you, ${userName}! 🎉`,
      content: (
        <div className="space-y-4">
          <p className="text-lg">Here's how CloneMe works in 3 simple steps:</p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-semibold">Create Your Voice</h4>
                <p className="text-sm text-surface-600 dark:text-surface-400">I'll learn how you naturally write emails</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-semibold">Tell Me What to Write</h4>
                <p className="text-sm text-surface-600 dark:text-surface-400">Just tell me what you want to say</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-semibold">Get Your Perfect Email</h4>
                <p className="text-sm text-surface-600 dark:text-surface-400">I'll write it exactly like you would!</p>
              </div>
            </div>
          </div>
        </div>
      ),
      canProceed: true
    },
    {
      title: "Let's Create Your First Voice! 🎯",
      content: (
        <div className="space-y-4">
          <p className="text-lg">A "voice" is how you write emails in different situations.</p>
          
          <div className="space-y-3">
            <p className="font-semibold">For example, you might write differently when emailing:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border-2 border-surface-200 dark:border-surface-700 p-3 rounded-lg">
                <p className="font-semibold">👔 Your Boss</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Professional and respectful</p>
              </div>
              
              <div className="border-2 border-surface-200 dark:border-surface-700 p-3 rounded-lg">
                <p className="font-semibold">👩‍🏫 Your Professor</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Formal and academic</p>
              </div>
              
              <div className="border-2 border-surface-200 dark:border-surface-700 p-3 rounded-lg">
                <p className="font-semibold">😊 Your Friends</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Casual and fun</p>
              </div>
              
              <div className="border-2 border-surface-200 dark:border-surface-700 p-3 rounded-lg">
                <p className="font-semibold">🤝 Your Clients</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Friendly but professional</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-center">
            <p className="font-semibold">Let's start with one voice - you can always add more later!</p>
          </div>
        </div>
      ),
      canProceed: true
    }
  ];
  
  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Save user preferences
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          firstName: userName,
          hasCompletedOnboarding: true,
          onboardingDate: new Date().toISOString()
        }, { merge: true });
      }
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-16 mx-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
                }`}
              />
            ))}
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6">{currentStepData.title}</h2>
          
          {currentStepData.content}
          
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!currentStepData.canProceed}
              className="ml-auto"
            >
              {currentStep === steps.length - 1 ? "Let's Start!" : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleOnboarding;