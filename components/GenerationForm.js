import { useState, useEffect } from 'react';
import { Card, Button, Select, TextArea, AlertBanner, Badge, LoadingSkeleton } from '../components';
import ContextDetector from './ContextDetector';
import HelpTooltip from './HelpTooltip';

export default function GenerationForm({
  voices,
  selectedVoice,
  onVoiceSelect,
  topic,
  onTopicChange,
  onGenerate,
  isGenerating,
  error,
  onErrorClose,
  filterVoiceId,
  onFilterChange
}) {
  const [showForm, setShowForm] = useState(false);
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    // Animate form entrance
    setTimeout(() => setShowForm(true), 100);
    setTimeout(() => setFormReady(true), 500);
  }, []);

  if (voices.length === 0 && !isGenerating) {
    return (
      <Card className="text-center p-12 animate-fadeIn">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mx-auto flex items-center justify-center">
            <span className="text-3xl">🎤</span>
          </div>
          <h3 className="text-xl font-semibold">Let's Create Your First Voice</h3>
          <p className="text-surface-600 dark:text-surface-400 max-w-md mx-auto">
            Before we can generate emails, you need to create at least one voice. It's quick and easy!
          </p>
          <Button
            onClick={() => window.location.href = '/voices'}
            size="lg"
            className="mt-4"
          >
            Create Your First Voice
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`mb-12 shadow-lg transition-all duration-700 ${showForm ? 'animate-slideIn' : 'opacity-0 translate-y-4'}`} 
      variant="gradient" 
      hover={false}
    >
      {error && (
        <AlertBanner
          type="error"
          message={error}
          className="mb-6 animate-fadeIn"
          onClose={onErrorClose}
        />
      )}

      <div className="space-y-6">
        <div className={`transition-all duration-500 delay-100 ${formReady ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Choose a voice:
            </label>
            <HelpTooltip content="Each voice represents a different writing style. You can train them to sound exactly like you!" />
          </div>
          
          <Select
            id="voice-select"
            value={selectedVoice?.id || ""}
            onChange={(e) => {
              const voiceId = e.target.value;
              const voice = voices.find((v) => v.id === voiceId);
              onVoiceSelect(voice);
              onFilterChange(voiceId);
            }}
            options={voices.map(voice => ({ 
              value: voice.id, 
              label: `${voice.name} (${voice.trainingLevel || 'Beginner'})` 
            }))}
            required
            className="max-w-md"
          />
          
          {selectedVoice && (
            <div className="mt-3 flex items-center space-x-3 animate-fadeIn">
              <Badge variant={selectedVoice.trainingLevel === 'expert' ? 'success' : 'primary'}>
                {selectedVoice.trainingLevel || 'Beginner'} Level
              </Badge>
              <span className="text-sm text-surface-600 dark:text-surface-400">
                {selectedVoice.feedbackMemory?.length || 0} training sessions
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => window.location.href = '/voices'}
              >
                Train this voice →
              </Button>
            </div>
          )}
        </div>

        <div className={`transition-all duration-500 delay-200 ${formReady ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              What do you want to say?
            </label>
            <HelpTooltip content="Just tell me what you want to communicate. I'll write it in your voice!" />
          </div>
          
          <TextArea
            id="topic"
            placeholder="e.g. I need to ask for an extension on my paper due Friday..."
            rows={4}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            required
            className="w-full"
          />
          
          {/* Smart Context Detection */}
          <ContextDetector
            topic={topic}
            voices={voices}
            onVoiceSelect={(voiceId) => {
              const voice = voices.find(v => v.id === voiceId);
              if (voice) {
                onVoiceSelect(voice);
                onFilterChange(voiceId);
              }
            }}
            selectedVoiceId={selectedVoice?.id}
          />
        </div>

        <div className={`transition-all duration-500 delay-300 ${formReady ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            id="generate-button"
            onClick={onGenerate}
            disabled={isGenerating || !selectedVoice || !topic}
            isLoading={isGenerating}
            size="lg"
            className={`shadow-lg transform transition-all duration-300 ${
              selectedVoice && topic && !isGenerating 
                ? 'hover:scale-105 animate-pulse' 
                : ''
            }`}
          >
            {isGenerating ? 'Creating Your Email...' : 'Generate Email'}
          </Button>
          
          {isGenerating && (
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 animate-fadeIn">
              I'm crafting your email to sound just like you...
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}