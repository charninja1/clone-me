import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, Badge } from './ui';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function VoiceCoachingChat({ voice, onClose }) {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: `Hi! I'm your voice coach. I'll help you create specific rules for how ${voice.name} should write. Unlike general instructions, these will be precise requirements. Let's start with: How would you describe your writing style?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Pre-defined coaching questions
  const coachingFlow = [
    "How formal or casual do you like to be?",
    "Do you prefer short and concise emails or more detailed ones?",
    "What phrases do you commonly use to start emails?",
    "How do you typically sign off?",
    "Are there any words or phrases you absolutely avoid?",
    "Do you use emojis or stay strictly professional?",
    "How do you handle sensitive topics?",
    "What's your approach to follow-up emails?"
  ];
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    // Save the rule based on the conversation
    try {
      const rule = {
        question: messages[messages.length - 1].content,
        answer: input,
        category: inferCategory(currentQuestionIndex),
        timestamp: new Date().toISOString()
      };
      
      const voiceRef = doc(db, 'voices', voice.id);
      await updateDoc(voiceRef, {
        coachingRules: arrayUnion(rule),
        lastCoachedAt: new Date().toISOString()
      });
      
      // Generate next question or completion message
      let nextMessage;
      if (currentQuestionIndex < coachingFlow.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        nextMessage = {
          type: 'assistant',
          content: `Great! That helps me understand better. Now, ${coachingFlow[currentQuestionIndex + 1]}`,
          timestamp: new Date()
        };
      } else {
        nextMessage = {
          type: 'assistant',
          content: `Perfect! I've learned a lot about your writing style. I'll use these insights to generate emails that sound exactly like you. Feel free to continue training me anytime!`,
          timestamp: new Date()
        };
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, nextMessage]);
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving coaching rule:', error);
      setIsProcessing(false);
    }
  };
  
  const inferCategory = (index) => {
    const categories = [
      'style',
      'formality',
      'length',
      'openings',
      'closings',
      'vocabulary',
      'emojis',
      'sensitivity',
      'follow-ups'
    ];
    return categories[index] || 'general';
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full h-[600px] p-0 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Create Voice Rules</h2>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Adding specific rules to: {voice.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <span className="text-xl">×</span>
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-surface-100 dark:bg-surface-800 p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}