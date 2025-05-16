import React, { useState } from 'react';
import { Button, Card, Input, TextArea, Badge } from './ui';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { generateVarietyPatterns } from '../lib/personalityVarieties';

const WIZARD_STEPS = {
  BASIC_INFO: 0,
  UPLOAD_SAMPLES: 1,
  PERSONALITY_QUIZ: 2,
  PRACTICE_EMAIL: 3,
  COMPLETE: 4
};

export default function VoiceOnboardingWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.BASIC_INFO);
  const [voiceData, setVoiceData] = useState({
    name: '',
    description: '',
    sampleEmails: [],
    personality: {
      formality: 50, // 0 = very casual, 100 = very formal
      warmth: 50,    // 0 = distant, 100 = very warm
      detail: 50,    // 0 = brief, 100 = very detailed
      emotion: 50    // 0 = neutral, 100 = very expressive
    },
    instructions: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testTopic, setTestTopic] = useState('');

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleEmailUpload = (emailText) => {
    setVoiceData(prev => ({
      ...prev,
      sampleEmails: [...prev.sampleEmails, emailText]
    }));
  };

  const generateInstructions = () => {
    const { personality } = voiceData;
    const formalityText = personality.formality > 70 ? 'very formal' : personality.formality > 30 ? 'moderately formal' : 'casual';
    const warmthText = personality.warmth > 70 ? 'warm and friendly' : personality.warmth > 30 ? 'pleasant' : 'professional and distant';
    const detailText = personality.detail > 70 ? 'detailed and thorough' : personality.detail > 30 ? 'moderately detailed' : 'brief and concise';
    const emotionText = personality.emotion > 70 ? 'expressive and emotional' : personality.emotion > 30 ? 'moderately expressive' : 'neutral and factual';

    // Generate variety patterns based on personality
    const varietyPatterns = generateVarietyPatterns(personality);
    
    let varietyExamples = `\n\nSpecific style guidelines:\n`;
    varietyExamples += `- Greetings: Use variations like ${varietyPatterns.openings.slice(0, 3).join(', ')}\n`;
    varietyExamples += `- Closings: End with ${varietyPatterns.closings.slice(0, 3).join(', ')}\n`;
    varietyExamples += `- Transitions: Connect thoughts with ${varietyPatterns.transitions.slice(0, 3).join(', ')}\n`;
    if (personality.warmth > 50) {
      varietyExamples += `- Acknowledgments: Express appreciation using ${varietyPatterns.acknowledgments.slice(0, 3).join(', ')}\n`;
    }
    if (personality.emotion > 50) {
      const emphasis = varietyPatterns.emphasis;
      if (emphasis && emphasis.emoticons && emphasis.emoticons.length > 0) {
        varietyExamples += `- Emoticons: Occasionally use ${emphasis.emoticons.slice(0, 3).join(' ')}\n`;
      }
    }

    return `Write in a ${formalityText} tone that is ${warmthText}. Be ${detailText} in responses. Maintain a ${emotionText} communication style. Based on the sample emails provided, match the user's natural writing patterns, vocabulary, and sentence structure.${varietyExamples}`;
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const instructions = generateInstructions();
      await addDoc(collection(db, 'voices'), {
        userId: auth.currentUser.uid,
        name: voiceData.name,
        description: voiceData.description,
        instructions,
        sampleEmails: voiceData.sampleEmails,
        personality: voiceData.personality,
        feedbackMemory: [],
        trainingLevel: 'beginner',
        createdAt: new Date().toISOString()
      });
      onComplete();
    } catch (error) {
      console.error('Error creating voice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Let's create your new voice</h3>
        <p className="text-surface-600 dark:text-surface-400">First, give your voice a name and description.</p>
      </div>
      
      <Input
        id="voice-name"
        label="Voice Name"
        placeholder="e.g., Professional, Academic, Friendly..."
        value={voiceData.name}
        onChange={(e) => setVoiceData(prev => ({ ...prev, name: e.target.value }))}
        required
      />
      
      <TextArea
        id="voice-description"
        label="Description"
        placeholder="Describe when you'd use this voice..."
        rows={3}
        value={voiceData.description}
        onChange={(e) => setVoiceData(prev => ({ ...prev, description: e.target.value }))}
      />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!voiceData.name}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderSampleUpload = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Upload sample emails</h3>
        <p className="text-surface-600 dark:text-surface-400">
          Share 2-3 emails you've written in this style. This helps the AI learn your unique voice.
        </p>
      </div>
      
      <div className="space-y-4">
        {voiceData.sampleEmails.map((email, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="primary">Sample {index + 1}</Badge>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setVoiceData(prev => ({
                    ...prev,
                    sampleEmails: prev.sampleEmails.filter((_, i) => i !== index)
                  }));
                }}
              >
                Remove
              </Button>
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-3">
              {email.substring(0, 150)}...
            </p>
          </Card>
        ))}
        
        <TextArea
          id="sample-email"
          label="Paste an email sample"
          placeholder="Copy and paste an email you've written..."
          rows={6}
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />
        
        <Button
          variant="secondary"
          onClick={() => {
            if (testEmail.trim()) {
              handleEmailUpload(testEmail);
              setTestEmail('');
            }
          }}
          disabled={!testEmail.trim()}
        >
          Add Sample
        </Button>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={voiceData.sampleEmails.length < 2}
        >
          Next ({voiceData.sampleEmails.length}/2 minimum)
        </Button>
      </div>
    </div>
  );

  const renderPersonalityQuiz = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Define your voice personality</h3>
        <p className="text-surface-600 dark:text-surface-400">
          Adjust these sliders to match how you write in this voice.
        </p>
      </div>
      
      <div className="space-y-6">
        {Object.entries({
          formality: {
            label: 'Formality',
            low: 'Casual',
            high: 'Formal'
          },
          warmth: {
            label: 'Warmth',
            low: 'Professional',
            high: 'Friendly'
          },
          detail: {
            label: 'Detail Level',
            low: 'Brief',
            high: 'Detailed'
          },
          emotion: {
            label: 'Expression',
            low: 'Neutral',
            high: 'Expressive'
          }
        }).map(([key, config]) => (
          <div key={key}>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{config.label}</label>
              <span className="text-sm text-surface-600 dark:text-surface-400">
                {voiceData.personality[key]}%
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-surface-500">{config.low}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={voiceData.personality[key]}
                onChange={(e) => {
                  setVoiceData(prev => ({
                    ...prev,
                    personality: {
                      ...prev.personality,
                      [key]: parseInt(e.target.value)
                    }
                  }));
                }}
                className="flex-1"
              />
              <span className="text-xs text-surface-500">{config.high}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );

  const renderPractice = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Let's practice!</h3>
        <p className="text-surface-600 dark:text-surface-400">
          Generate a test email to see if the voice matches your style.
        </p>
      </div>
      
      <TextArea
        id="test-topic"
        label="What should the email be about?"
        placeholder="e.g., Asking for a meeting, thanking someone..."
        rows={3}
        value={testTopic}
        onChange={(e) => setTestTopic(e.target.value)}
      />
      
      <Card className="p-4 bg-surface-50 dark:bg-surface-800">
        <p className="text-sm text-surface-600 dark:text-surface-400">
          The AI will use these settings:
        </p>
        <ul className="mt-2 text-sm space-y-1">
          <li>• Name: {voiceData.name}</li>
          <li>• Formality: {voiceData.personality.formality}%</li>
          <li>• Warmth: {voiceData.personality.warmth}%</li>
          <li>• Detail: {voiceData.personality.detail}%</li>
          <li>• Expression: {voiceData.personality.emotion}%</li>
          <li>• Sample emails: {voiceData.sampleEmails.length} provided</li>
        </ul>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button 
          onClick={handleComplete}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create Voice
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="text-5xl">🎉</div>
      <h3 className="text-xl font-semibold">Voice created successfully!</h3>
      <p className="text-surface-600 dark:text-surface-400">
        Your new voice "{voiceData.name}" is ready to use. The AI will continue learning from your feedback.
      </p>
      <Button onClick={onComplete}>
        Start Using Voice
      </Button>
    </div>
  );

  const steps = {
    [WIZARD_STEPS.BASIC_INFO]: renderBasicInfo,
    [WIZARD_STEPS.UPLOAD_SAMPLES]: renderSampleUpload,
    [WIZARD_STEPS.PERSONALITY_QUIZ]: renderPersonalityQuiz,
    [WIZARD_STEPS.PRACTICE_EMAIL]: renderPractice,
    [WIZARD_STEPS.COMPLETE]: renderComplete
  };

  const stepTitles = ['Basic Info', 'Upload Samples', 'Personality', 'Practice', 'Complete'];

  return (
    <Card className="max-w-2xl mx-auto p-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {stepTitles.map((title, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index === currentStep
                  ? 'text-primary-600'
                  : index < currentStep
                  ? 'text-success-600'
                  : 'text-surface-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  index === currentStep
                    ? 'border-primary-600 bg-primary-100'
                    : index < currentStep
                    ? 'border-success-600 bg-success-100'
                    : 'border-surface-300 bg-surface-100'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <div
                  className={`h-1 w-full mx-2 ${
                    index < currentStep ? 'bg-success-600' : 'bg-surface-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs">
          {stepTitles.map((title, index) => (
            <span
              key={index}
              className={
                index === currentStep
                  ? 'text-primary-600 font-medium'
                  : 'text-surface-500'
              }
            >
              {title}
            </span>
          ))}
        </div>
      </div>
      
      {/* Render current step */}
      {steps[currentStep]()}
    </Card>
  );
}