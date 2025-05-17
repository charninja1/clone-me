import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components';
import LoadingSkeleton from './ui/LoadingSkeleton';

export default function VoicesList({
  voices,
  onEdit,
  onDelete,
  onTrain,
  isLoading = false
}) {
  const [animatedItems, setAnimatedItems] = useState({});
  
  useEffect(() => {
    // Animate voices as they appear
    voices.forEach((voice, index) => {
      setTimeout(() => {
        setAnimatedItems(prev => ({ ...prev, [voice.id]: true }));
      }, index * 100);
    });
  }, [voices]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} height={200} />
      </div>
    );
  }

  if (voices.length === 0) {
    return (
      <Card className="text-center p-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mx-auto flex items-center justify-center">
            <span className="text-3xl">🎤</span>
          </div>
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white">Create Your First Voice</h3>
          <p className="text-surface-600 dark:text-surface-400 max-w-md mx-auto">
            Start by creating a voice that captures your unique writing style.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {voices.map((voice) => (
        <Card
          key={voice.id}
          className={`transition-all duration-500 ${
            animatedItems[voice.id] ? 'animate-slideIn' : 'opacity-0 translate-y-4'
          }`}
          hover={true}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                  {voice.name}
                </h3>
                <Badge 
                  variant={voice.trainingLevel === 'expert' ? 'success' : 'primary'}
                  className="animate-fadeIn"
                >
                  {voice.trainingLevel || 'Beginner'} Level
                </Badge>
                {voice.isDefault && (
                  <Badge variant="success" className="animate-fadeIn">
                    ⭐ Default
                  </Badge>
                )}
              </div>
              
              {voice.description && (
                <p className="text-surface-600 dark:text-surface-400 mb-4">
                  {voice.description}
                </p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Formality</p>
                  <p className="font-medium">{voice.tone?.formality || 50}/100</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Warmth</p>
                  <p className="font-medium">{voice.tone?.warmth || 50}/100</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Emotion</p>
                  <p className="font-medium">{voice.tone?.emotion || 50}/100</p>
                </div>
              </div>
              
              <div className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
                <p>{voice.feedbackMemory?.length || 0} training sessions completed</p>
                <p>{voice.sampleEmails?.length || 0} sample emails provided</p>
              </div>
            </div>
            
            <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onTrain(voice.id)}
                className="hover:scale-105 transition-transform flex-1 lg:flex-none"
              >
                Train Voice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(voice)}
                className="hover:scale-105 transition-transform flex-1 lg:flex-none"
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(voice.id)}
                className="hover:scale-105 transition-transform text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 flex-1 lg:flex-none"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}