import React, { useState } from 'react';
import { Button, Card, TextArea, Badge } from './ui';

const demoVoices = [
  { id: 'professional', name: 'Professional', description: 'Formal business communication' },
  { id: 'casual', name: 'Casual', description: 'Friendly and relaxed tone' },
  { id: 'academic', name: 'Academic', description: 'Scholarly and precise language' },
];

const demoTemplates = [
  { id: 1, text: 'Request a meeting with my manager about project timeline' },
  { id: 2, text: 'Thank a colleague for their help on a presentation' },
  { id: 3, text: 'Follow up on a job application' },
  { id: 4, text: 'Apologize for missing a deadline' },
];

export default function InteractivePlayground() {
  const [selectedVoice, setSelectedVoice] = useState(demoVoices[0]);
  const [prompt, setPrompt] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [error, setError] = useState('');

  const generateDemoEmail = async () => {
    if (!prompt.trim()) {
      setError('Please enter what you want to say');
      return;
    }

    setError('');
    setIsGenerating(true);

    // Simulate API call with demo response
    setTimeout(() => {
      const demoResponses = {
        professional: {
          subject: 'Meeting Request - Project Timeline Discussion',
          body: `Dear [Manager Name],

I hope this email finds you well. I am writing to request a meeting to discuss the current project timeline.

I believe it would be beneficial to review our progress and address any potential adjustments that may be needed to ensure we meet our deliverables on schedule.

Would you have availability this week for a brief discussion? I am flexible with timing and can work around your schedule.

Thank you for your consideration.

Best regards,
[Your Name]`
        },
        casual: {
          subject: 'Quick chat about the project?',
          body: `Hey [Manager Name],

Hope you're doing well! I was wondering if we could grab some time this week to chat about the project timeline.

I think it'd be good to touch base and see if we need to adjust anything to stay on track.

Let me know what works for you - I'm pretty flexible!

Thanks!
[Your Name]`
        },
        academic: {
          subject: 'Request for Consultation Regarding Project Timeline',
          body: `Dear Professor [Name],

I am writing to request a consultation regarding the current project timeline for [Project Name].

Given the complexity of the research methodology and recent developments in our data collection phase, I believe a reassessment of our timeline parameters would be prudent.

I would greatly appreciate the opportunity to discuss potential modifications to ensure optimal project outcomes while maintaining academic rigor.

Sincerely,
[Your Name]`
        }
      };

      const response = demoResponses[selectedVoice.id] || demoResponses.professional;
      const fullEmail = `Subject: ${response.subject}\n\n${response.body}`;
      
      setGeneratedEmail(fullEmail);
      setWordCount(fullEmail.split(/\s+/).length);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    // We'll add animation later
    alert('Email copied to clipboard!');
  };

  const selectTemplate = (template) => {
    setPrompt(template.text);
  };

  return (
    <div className="py-16 px-4" id="playground">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fadeInDown">
          <h2 className="text-3xl font-bold mb-4">Try It Now - No Sign Up Required</h2>
          <p className="text-lg text-surface-600 dark:text-surface-400">
            Experience the power of AI email generation instantly
          </p>
        </div>

        <Card className="p-6">
          {/* Voice Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Choose a voice:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {demoVoices.map((voice, index) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice)}
                  className={`p-3 rounded-lg border-2 transition-all animate-scaleUp hover-lift ${
                    selectedVoice.id === voice.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-surface-600 dark:text-surface-400">
                    {voice.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Quick templates:</label>
            <div className="flex flex-wrap gap-2">
              {demoTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => selectTemplate(template)}
                  className="hover:scale-105 transform transition-all"
                >
                  {template.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              What do you want to say?
            </label>
            <TextArea
              placeholder="e.g., I need to thank my team for their hard work on the project..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          {/* Generate Button */}
          <div className="mb-6 text-center">
            <Button
              onClick={generateDemoEmail}
              isLoading={isGenerating}
              size="lg"
              className="shadow-lg"
            >
              Generate Email
            </Button>
          </div>

          {/* Generated Email */}
          {generatedEmail && (
            <div className="animate-slideIn">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Generated Email</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="primary">
                    {wordCount} words
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    icon={<span>📋</span>}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-surface-800 dark:text-surface-200">
                  {generatedEmail}
                </pre>
              </div>
              <div className="mt-4 text-center">
                <p className="text-surface-600 dark:text-surface-400 mb-3">
                  Ready to create your own personalized AI voice?
                </p>
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="primary"
                  size="lg"
                  className="shadow-lg"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}