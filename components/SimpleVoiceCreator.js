import React, { useState } from 'react';
import { Button, Card, Input, TextArea } from './ui';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const VOICE_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    emoji: '👔',
    description: 'For work emails, your boss, or business contacts',
    personality: { formality: 70, warmth: 50, detail: 60, emotion: 30 },
    instructions: 'Write professionally and clearly. Be respectful and formal but not stiff. Focus on clarity and getting to the point.',
    examples: [
      "Hi [Name],\n\nI hope this email finds you well. I wanted to follow up on our conversation from yesterday regarding the project timeline.\n\nBest regards,\n[Your name]",
      "Dear [Name],\n\nThank you for your time today. I've attached the documents we discussed for your review.\n\nPlease let me know if you have any questions.\n\nKind regards,\n[Your name]"
    ]
  },
  {
    id: 'academic',
    name: 'Academic',
    emoji: '🎓',
    description: 'For professors, academic advisors, or school-related emails',
    personality: { formality: 80, warmth: 40, detail: 70, emotion: 20 },
    instructions: 'Write formally and respectfully. Use proper titles and academic language. Be clear about your purpose.',
    examples: [
      "Dear Professor [Name],\n\nI am writing to inquire about the upcoming assignment for [Course Name]. I have a question regarding the third requirement.\n\nThank you for your time.\n\nSincerely,\n[Your name]",
      "Dear Dr. [Name],\n\nI hope this email finds you well. I would like to request a meeting to discuss my research proposal.\n\nBest regards,\n[Your name]"
    ]
  },
  {
    id: 'friendly',
    name: 'Friendly',
    emoji: '😊',
    description: 'For friends, casual acquaintances, or informal situations',
    personality: { formality: 20, warmth: 80, detail: 50, emotion: 70 },
    instructions: 'Write casually and warmly. Use contractions and conversational language. Show personality and emotion.',
    examples: [
      "Hey [Name]!\n\nHow's it going? Just wanted to check in and see if you're still up for coffee this weekend.\n\nLet me know!\n[Your name]",
      "Hi [Name]!\n\nThanks so much for helping me out yesterday - you're the best! 😊\n\nTalk soon,\n[Your name]"
    ]
  },
  {
    id: 'custom',
    name: 'Custom',
    emoji: '✨',
    description: 'Create your own unique voice from scratch',
    personality: { formality: 50, warmth: 50, detail: 50, emotion: 50 },
    instructions: '',
    examples: []
  }
];

const SimpleVoiceCreator = ({ onComplete }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [voiceName, setVoiceName] = useState('');
  const [sampleEmail, setSampleEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    if (template.id !== 'custom') {
      setVoiceName(template.name);
      setSampleEmail(template.examples[0] || '');
    }
  };
  
  const handleCreate = async () => {
    if (!selectedTemplate || !voiceName.trim()) return;
    
    setIsCreating(true);
    try {
      const template = selectedTemplate;
      
      await addDoc(collection(db, 'voices'), {
        userId: auth.currentUser.uid,
        name: voiceName,
        description: template.description,
        instructions: template.instructions || `Write emails in a ${voiceName.toLowerCase()} style.`,
        personality: template.personality,
        sampleEmails: sampleEmail ? [sampleEmail] : template.examples,
        feedbackMemory: [],
        trainingLevel: 'beginner',
        templateId: template.id,
        createdAt: new Date().toISOString()
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating voice:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Create Your First Voice</h2>
        <p className="text-surface-600 dark:text-surface-400">Choose a template or create your own</p>
      </div>
      
      {/* Template Selection */}
      {!selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOICE_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="p-6">
                <div className="text-4xl mb-3">{template.emoji}</div>
                <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">{template.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Voice Configuration */}
      {selectedTemplate && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">{selectedTemplate.emoji}</span>
                {selectedTemplate.name} Voice
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                Change Template
              </Button>
            </div>
            
            {/* Voice Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                What do you want to call this voice?
              </label>
              <Input
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g., Work Emails, Professor Smith, Casual Friends"
                className="w-full"
              />
              <p className="text-xs text-surface-500 mt-1">
                Choose a name that helps you remember when to use this voice
              </p>
            </div>
            
            {/* Sample Email */}
            {selectedTemplate.id !== 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sample Email (you can edit this)
                </label>
                <TextArea
                  value={sampleEmail}
                  onChange={(e) => setSampleEmail(e.target.value)}
                  rows={6}
                  className="w-full"
                  placeholder="Paste an example of how you write in this style..."
                />
                <p className="text-xs text-surface-500 mt-1">
                  This helps me learn your writing style. You can add more examples later!
                </p>
              </div>
            )}
            
            {/* Show example if available */}
            {selectedTemplate.id !== 'custom' && !showAdvanced && (
              <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Example {selectedTemplate.name} email:</p>
                <pre className="text-sm whitespace-pre-wrap text-surface-600 dark:text-surface-400">
                  {selectedTemplate.examples[0]}
                </pre>
              </div>
            )}
            
            {/* Advanced Options Toggle */}
            {selectedTemplate.id === 'custom' && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      Advanced customization options will be available after creating your voice.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Create Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!voiceName.trim() || isCreating}
                isLoading={isCreating}
              >
                Create Voice
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SimpleVoiceCreator;