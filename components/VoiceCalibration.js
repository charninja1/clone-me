import React, { useState } from 'react';
import { Button, Card, Badge, TextArea } from './ui';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function VoiceCalibration({ voice, onComplete }) {
  const [currentEmail, setCurrentEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Move to next calibration step
      setCalibrationStep(prev => prev + 1);
    } catch (error) {
      console.error('Error saving feedback:', error);
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

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Calibrating: {voice.name}</h3>
        <Badge variant="primary">
          Step {calibrationStep + 1} of {testScenarios.length}
        </Badge>
      </div>

      {/* Current scenario */}
      <Card className="p-6 bg-surface-50 dark:bg-surface-800">
        <h4 className="font-medium mb-2">{currentScenario.title}</h4>
        <p className="text-surface-600 dark:text-surface-400">
          {currentScenario.prompt}
        </p>
      </Card>

      {/* Generated email */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-medium">Generated Email</h4>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              // Generate new version
              setIsLoading(true);
              // Simulate generation
              setTimeout(() => {
                setCurrentEmail(`Sample email for ${currentScenario.id}`);
                setIsLoading(false);
              }, 1000);
            }}
            isLoading={isLoading}
          >
            Regenerate
          </Button>
        </div>
        
        <div className="prose dark:prose-invert">
          <p className="whitespace-pre-wrap">
            {currentEmail || 'Click regenerate to create a sample email...'}
          </p>
        </div>
      </Card>

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
              } else {
                onComplete();
              }
            }}
          >
            {calibrationStep < testScenarios.length - 1 ? 'Next' : 'Complete'}
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