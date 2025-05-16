import React, { useEffect, useState } from 'react';
import { analyzeContext, EMAIL_TYPES, RECIPIENT_TYPES } from '../lib/contextDetection';
import { Badge } from './ui';

const ContextDetector = ({ topic, voices, onVoiceSelect, selectedVoiceId }) => {
  const [context, setContext] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  useEffect(() => {
    if (topic && topic.length > 10) { // Only analyze if topic has enough content
      const analysis = analyzeContext(topic, voices);
      setContext(analysis);
      
      // Auto-select voice if confidence is high and no voice is selected
      if (!selectedVoiceId && 
          analysis.voiceRecommendation.recommendedVoice && 
          analysis.voiceRecommendation.matchScore > 0.8) {
        onVoiceSelect(analysis.voiceRecommendation.recommendedVoice.id);
      }
    } else {
      setContext(null);
    }
  }, [topic, voices, selectedVoiceId, onVoiceSelect]);
  
  if (!context || !topic) return null;
  
  const typeLabels = {
    [EMAIL_TYPES.THANK_YOU]: '🙏 Thank You',
    [EMAIL_TYPES.REQUEST]: '📝 Request',
    [EMAIL_TYPES.FOLLOW_UP]: '🔄 Follow-up',
    [EMAIL_TYPES.APOLOGY]: '😔 Apology',
    [EMAIL_TYPES.INTRODUCTION]: '👋 Introduction',
    [EMAIL_TYPES.ANNOUNCEMENT]: '📢 Announcement',
    [EMAIL_TYPES.INVITATION]: '🎉 Invitation',
    [EMAIL_TYPES.CONFIRMATION]: '✅ Confirmation',
    [EMAIL_TYPES.GENERAL]: '📧 General'
  };
  
  const recipientLabels = {
    [RECIPIENT_TYPES.PROFESSOR]: '🎓 Professor',
    [RECIPIENT_TYPES.BOSS]: '💼 Boss',
    [RECIPIENT_TYPES.COLLEAGUE]: '👥 Colleague',
    [RECIPIENT_TYPES.CLIENT]: '🤝 Client',
    [RECIPIENT_TYPES.FRIEND]: '😊 Friend',
    [RECIPIENT_TYPES.FAMILY]: '👨‍👩‍👧‍👦 Family',
    [RECIPIENT_TYPES.STRANGER]: '🙋 Stranger',
    [RECIPIENT_TYPES.SUPPORT]: '🛠️ Support',
    [RECIPIENT_TYPES.GENERAL]: '👤 General'
  };
  
  return (
    <div className="bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4 mb-4 border border-surface-200 dark:border-surface-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100">
          Smart Context Detection
        </h4>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
        >
          {showSuggestions ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {showSuggestions && (
        <>
          {/* Detected Context */}
          <div className="flex flex-wrap gap-2 mb-3">
            {context.emailType.confidence > 0.3 && (
              <Badge variant="primary">
                {typeLabels[context.emailType.type]}
                <span className="ml-1 opacity-70">
                  {Math.round(context.emailType.confidence * 100)}%
                </span>
              </Badge>
            )}
            
            {context.recipient.confidence > 0.3 && (
              <Badge variant="secondary">
                {recipientLabels[context.recipient.type]}
                <span className="ml-1 opacity-70">
                  {Math.round(context.recipient.confidence * 100)}%
                </span>
              </Badge>
            )}
          </div>
          
          {/* Voice Recommendation */}
          {context.voiceRecommendation.recommendedVoice && (
            <div className="mb-3">
              <p className="text-xs text-surface-600 dark:text-surface-400 mb-1">
                Recommended voice:
              </p>
              <div 
                className="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                onClick={() => onVoiceSelect(context.voiceRecommendation.recommendedVoice.id)}
              >
                <Badge variant="primary">
                  {context.voiceRecommendation.recommendedVoice.name}
                </Badge>
                <span className="text-xs text-surface-600 dark:text-surface-400">
                  {Math.round(context.voiceRecommendation.matchScore * 100)}% match
                </span>
                {selectedVoiceId === context.voiceRecommendation.recommendedVoice.id && (
                  <span className="text-xs text-primary-600 dark:text-primary-400 ml-auto">✓ Selected</span>
                )}
              </div>
            </div>
          )}
          
          {/* Suggestions */}
          {context.suggestions.length > 0 && (
            <div>
              <p className="text-xs text-surface-600 dark:text-surface-400 mb-1">
                Tips for this email:
              </p>
              <ul className="space-y-1">
                {context.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs text-surface-500 dark:text-surface-400 flex items-start">
                    <span className="mr-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className="text-xs text-surface-400 cursor-pointer">Debug Info</summary>
              <pre className="text-xs mt-2 p-2 bg-surface-100 dark:bg-surface-900 rounded overflow-x-auto">
                {JSON.stringify(context, null, 2)}
              </pre>
            </details>
          )}
        </>
      )}
    </div>
  );
};

export default ContextDetector;