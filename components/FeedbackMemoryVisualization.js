import React, { useState } from 'react';
import { Card, Badge, Button } from './ui';

export default function FeedbackMemoryVisualization({ voice, feedbackHistory }) {
  const [view, setView] = useState('timeline'); // timeline, improvements, patterns
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Group feedback by type
  const groupedFeedback = feedbackHistory.reduce((acc, item) => {
    const type = item.type || 'general';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  // Extract learning patterns
  const learningPatterns = {
    formality: {
      trend: calculateTrend(feedbackHistory, ['too_formal', 'too_casual']),
      improvements: countImprovements(feedbackHistory, 'formality')
    },
    length: {
      trend: calculateTrend(feedbackHistory, ['too_long', 'too_short']),
      improvements: countImprovements(feedbackHistory, 'length')
    },
    style: {
      trend: calculateTrend(feedbackHistory, ['not_my_style', 'perfect_tone']),
      improvements: countImprovements(feedbackHistory, 'style')
    }
  };

  function calculateTrend(history, types) {
    const relevant = history.filter(h => types.includes(h.type));
    if (relevant.length < 2) return 'stable';
    // Simplified trend calculation
    return 'improving';
  }

  function countImprovements(history, category) {
    // Simplified improvement counting
    return Math.floor(history.length / 3);
  }

  const renderTimeline = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-surface-800 dark:text-surface-200">Training Timeline</h4>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-surface-300 dark:bg-surface-700" />
        
        {/* Timeline items */}
        <div className="space-y-6">
          {feedbackHistory.slice().reverse().map((item, index) => (
            <div key={index} className="relative flex items-start">
              {/* Timeline dot */}
              <div className="absolute left-4 w-2 h-2 bg-primary-600 rounded-full -translate-x-1/2 mt-2" />
              
              {/* Content */}
              <div className="ml-10 flex-1">
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedFeedback(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={item.type === 'perfect_tone' ? 'success' : 'primary'}>
                      {item.label || item.type}
                    </Badge>
                    <span className="text-xs text-surface-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {item.feedback && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 italic">
                      "{item.feedback}"
                    </p>
                  )}
                  
                  <div className="mt-3 text-xs text-surface-500">
                    <span>Original: </span>
                    <span className="text-surface-600 dark:text-surface-400">
                      {item.originalEmail?.substring(0, 50)}...
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderImprovements = () => (
    <div className="space-y-6">
      <h4 className="font-medium text-surface-800 dark:text-surface-200">AI Learning Progress</h4>
      
      {Object.entries(learningPatterns).map(([category, data]) => (
        <Card key={category} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-medium capitalize">{category}</h5>
            <Badge variant={data.trend === 'improving' ? 'success' : 'primary'}>
              {data.trend}
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-surface-500 mb-1">
              <span>Learning Progress</span>
              <span>{data.improvements * 10}%</span>
            </div>
            <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(data.improvements * 10, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Before/After examples */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-surface-600 dark:text-surface-400">Before</span>
              <Card className="p-3 mt-1 bg-surface-50 dark:bg-surface-800">
                <p className="text-sm">Early email example...</p>
              </Card>
            </div>
            <div>
              <span className="text-xs font-medium text-surface-600 dark:text-surface-400">After</span>
              <Card className="p-3 mt-1 bg-success-50 dark:bg-success-900/20">
                <p className="text-sm">Improved email example...</p>
              </Card>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      <h4 className="font-medium text-surface-800 dark:text-surface-200">Learning Patterns</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common feedback */}
        <Card className="p-6">
          <h5 className="font-medium mb-4">Most Common Feedback</h5>
          <div className="space-y-2">
            {Object.entries(groupedFeedback)
              .sort(([, a], [, b]) => b.length - a.length)
              .slice(0, 5)
              .map(([type, items]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm">{type.replace(/_/g, ' ')}</span>
                  <Badge variant="primary">{items.length}</Badge>
                </div>
              ))}
          </div>
        </Card>
        
        {/* AI insights */}
        <Card className="p-6">
          <h5 className="font-medium mb-4">AI Insights</h5>
          <ul className="space-y-3 text-sm text-surface-600 dark:text-surface-400">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your {voice.name} voice prefers shorter sentences based on feedback</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Formality level has been adjusted 3 times</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Vocabulary matches your style 85% of the time</span>
            </li>
          </ul>
        </Card>
      </div>
      
      {/* Training stats */}
      <Card className="p-6 bg-primary-50 dark:bg-primary-900/20">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">{feedbackHistory.length}</div>
            <div className="text-sm text-primary-800 dark:text-primary-200">Total Feedback</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {Math.round((feedbackHistory.filter(f => f.type === 'perfect_tone').length / feedbackHistory.length) * 100)}%
            </div>
            <div className="text-sm text-primary-800 dark:text-primary-200">Perfect Matches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">{voice.trainingLevel || 'Learning'}</div>
            <div className="text-sm text-primary-800 dark:text-primary-200">Training Level</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const views = {
    timeline: renderTimeline,
    improvements: renderImprovements,
    patterns: renderPatterns
  };

  return (
    <div className="space-y-6">
      {/* View selector */}
      <div className="flex space-x-2">
        {Object.keys(views).map(viewType => (
          <Button
            key={viewType}
            variant={view === viewType ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView(viewType)}
          >
            {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
          </Button>
        ))}
      </div>
      
      {/* Render selected view */}
      {views[view]()}
      
      {/* Selected feedback detail */}
      {selectedFeedback && (
        <Card className="fixed bottom-4 right-4 p-6 max-w-md shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium">Feedback Detail</h4>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedFeedback(null)}
            >
              ✕
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-xs text-surface-500">Type</span>
              <p className="font-medium">{selectedFeedback.label}</p>
            </div>
            
            {selectedFeedback.feedback && (
              <div>
                <span className="text-xs text-surface-500">Feedback</span>
                <p className="text-sm">{selectedFeedback.feedback}</p>
              </div>
            )}
            
            <div>
              <span className="text-xs text-surface-500">Date</span>
              <p className="text-sm">{new Date(selectedFeedback.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}