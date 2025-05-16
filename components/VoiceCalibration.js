import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, TextArea } from './ui';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function VoiceCalibration({ voice, onComplete }) {
  const [currentEmail, setCurrentEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeneratedEmail, setHasGeneratedEmail] = useState(false);

  // Quick feedback options
  const quickFeedback = [
    { id: 'too_formal', label: 'Too formal', icon: '🎩' },
    { id: 'too_casual', label: 'Too casual', icon: '😎' },
    { id: 'perfect_tone', label: 'Perfect tone!', icon: '✨' },
    { id: 'not_my_style', label: 'Not my style', icon: '🚫' },
    { id: 'almost_there', label: 'Almost there', icon: '🎯' },
    { id: 'too_long', label: 'Too long', icon: '📏' },
    { id: 'too_short', label: 'Too short', icon: '📌' },
    { id: 'wrong_vocabulary', label: 'Wrong words', icon: '📝' }
  ];

  const handleQuickFeedback = async (feedbackType) => {
    if (!currentEmail) {
      alert('Please generate an email first');
      return;
    }
    
    const feedbackItem = {
      type: feedbackType.id,
      label: feedbackType.label,
      email: currentEmail,
      timestamp: new Date().toISOString()
    };

    try {
      const voiceRef = doc(db, 'voices', voice.id);
      await updateDoc(voiceRef, {
        feedbackMemory: arrayUnion(feedbackItem),
        trainingLevel: calculateTrainingLevel(voice.feedbackMemory?.length || 0)
      });
      
      // Show success feedback
      alert('Feedback saved! ' + feedbackType.label);
      
      // If it's positive feedback, automatically move to next step
      if (feedbackType.id === 'perfect_tone' || feedbackType.id === 'almost_there') {
        setTimeout(() => {
          if (calibrationStep < testScenarios.length - 1) {
            setCalibrationStep(prev => prev + 1);
            setCurrentEmail('');
            setFeedback('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            onComplete();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const handleDetailedFeedback = async () => {
    if (!currentEmail) {
      alert('Please generate an email first');
      return;
    }
    
    if (!feedback.trim()) {
      alert('Please enter some feedback');
      return;
    }
    
    const feedbackItem = {
      type: 'detailed',
      label: 'Detailed feedback',
      email: currentEmail,
      detailedFeedback: feedback,
      timestamp: new Date().toISOString()
    };

    try {
      const voiceRef = doc(db, 'voices', voice.id);
      await updateDoc(voiceRef, {
        feedbackMemory: arrayUnion(feedbackItem),
        trainingLevel: calculateTrainingLevel(voice.feedbackMemory?.length || 0)
      });
      
      // Clear the feedback and show success
      setFeedback('');
      alert('Detailed feedback saved! Thank you for helping train your voice.');
    } catch (error) {
      console.error('Error saving detailed feedback:', error);
      alert('Error saving feedback. Please try again.');
    }
  };

  const calculateTrainingLevel = (feedbackCount) => {
    if (feedbackCount >= 20) return 'expert';
    if (feedbackCount >= 10) return 'trained';
    if (feedbackCount >= 5) return 'learning';
    return 'beginner';
  };

  const handleHighlight = (text, start, end) => {
    setHighlights(prev => [...prev, { text, start, end, type: 'needs_improvement' }]);
  };

  const testScenarios = [
    {
      id: 'request',
      title: 'Making a request',
      prompt: 'Write an email asking for a deadline extension'
    },
    {
      id: 'thank_you',
      title: 'Saying thanks',
      prompt: 'Write a thank you email for a job interview'
    },
    {
      id: 'update',
      title: 'Giving an update',
      prompt: 'Write a project status update email'
    },
    {
      id: 'apology',
      title: 'Apologizing',
      prompt: 'Write an apology email for missing a meeting'
    }
  ];

  const currentScenario = testScenarios[calibrationStep % testScenarios.length];
  
  // Generate sample email
  const generateSample = async () => {
    setIsLoading(true);
    setHasGeneratedEmail(false);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentScenario.prompt,
          voiceId: voice.id,
          examples: JSON.stringify(voice.sampleEmails || [])
        })
      });
      
      const data = await response.json();
      setCurrentEmail(data.result || 'Error generating email');
      setHasGeneratedEmail(true);
      
      // Scroll to top to show the generated email
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Also scroll the component into view
      const element = document.getElementById('calibration-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      console.error('Error generating sample:', error);
      setCurrentEmail('Error generating email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-generate on scenario change
  useEffect(() => {
    generateSample();
  }, [calibrationStep]);

  return (
    <div id="calibration-container" className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Calibrating: {voice.name}</h3>
        <Badge variant="primary">
          Step {calibrationStep + 1} of {testScenarios.length}
        </Badge>
      </div>

      {/* Current scenario */}
      <Card className="p-6 bg-surface-50 dark:bg-surface-800">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium mb-2">{currentScenario.title}</h4>
            <p className="text-surface-600 dark:text-surface-400">
              {currentScenario.prompt}
            </p>
          </div>
          <Button
            onClick={generateSample}
            disabled={isLoading}
            isLoading={isLoading}
            size="sm"
            variant="secondary"
          >
            {isLoading ? 'Generating...' : (hasGeneratedEmail ? 'Regenerate' : 'Generate')}
          </Button>
        </div>
      </Card>

      {/* Generated email */}
      {isLoading ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-surface-600 dark:text-surface-400">Generating email...</p>
          </div>
        </Card>
      ) : currentEmail ? (
        <Card className="p-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Generated Email</h4>
            {hasGeneratedEmail && (
              <Badge variant="success" className="animate-pulse">
                New Email Generated!
              </Badge>
            )}
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 p-4 rounded">
              {currentEmail}
            </pre>
          </div>
        </Card>
      ) : null}

      {/* Quick feedback buttons */}
      <div>
        <h4 className="font-medium mb-3">Quick Feedback</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickFeedback.map(item => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickFeedback(item)}
              className="justify-start"
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Detailed feedback */}
      <div>
        <TextArea
          id="detailed-feedback"
          label="Detailed Feedback (optional)"
          placeholder="What specific changes would make this sound more like you?"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        {feedback && (
          <Button
            onClick={() => handleDetailedFeedback()}
            variant="primary"
            size="sm"
            className="mt-3"
          >
            Submit Feedback
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onComplete}
        >
          Finish Later
        </Button>
        <div className="space-x-3">
          {calibrationStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCalibrationStep(prev => prev - 1)}
            >
              Previous
            </Button>
          )}
          <Button
            onClick={() => {
              if (calibrationStep < testScenarios.length - 1) {
                setCalibrationStep(prev => prev + 1);
                setCurrentEmail('');
                setFeedback('');
                // Scroll to top when moving to next step
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                onComplete();
              }
            }}
          >
            {calibrationStep < testScenarios.length - 1 ? 'Next Scenario' : 'Complete Training'}
          </Button>
        </div>
      </div>

      {/* Training tips */}
      <Card className="p-4 bg-primary-50 dark:bg-primary-900/20">
        <p className="text-sm text-primary-800 dark:text-primary-200">
          💡 <strong>Tip:</strong> The more specific your feedback, the better the AI learns your style. 
          Try highlighting phrases that don't sound like you and suggesting alternatives.
        </p>
      </Card>
    </div>
  );
}