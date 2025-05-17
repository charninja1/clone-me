import React, { useState, useEffect } from 'react';
import { Button, Card, Input, TextArea, Badge } from './ui';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function VoiceRules({ voice, onUpdate }) {
  const [rules, setRules] = useState(voice.customRules || []);
  const [coachingRules, setCoachingRules] = useState(voice.coachingRules || []);
  const [newRule, setNewRule] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Categories for organizing rules
  const categories = {
    style: { name: 'Writing Style', icon: '✍️' },
    formality: { name: 'Formality Level', icon: '🎩' },
    vocabulary: { name: 'Vocabulary', icon: '📚' },
    openings: { name: 'Email Openings', icon: '👋' },
    closings: { name: 'Email Closings', icon: '👋' },
    structure: { name: 'Structure', icon: '🏗️' },
    tone: { name: 'Tone', icon: '🎭' },
    emojis: { name: 'Emojis & Symbols', icon: '😊' },
    general: { name: 'General', icon: '📝' }
  };
  
  const addRule = async () => {
    if (!newRule.trim()) return;
    
    const rule = {
      content: newRule,
      category: 'general',
      createdAt: new Date().toISOString(),
      enabled: true
    };
    
    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    setNewRule('');
    setIsAdding(false);
    
    await saveRules(updatedRules);
  };
  
  const editRule = async (index) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ...updatedRules[index],
      content: editValue,
      updatedAt: new Date().toISOString()
    };
    
    setRules(updatedRules);
    setEditingIndex(null);
    setEditValue('');
    
    await saveRules(updatedRules);
  };
  
  const deleteRule = async (index) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    await saveRules(updatedRules);
  };
  
  const toggleRule = async (index) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ...updatedRules[index],
      enabled: !updatedRules[index].enabled
    };
    
    setRules(updatedRules);
    await saveRules(updatedRules);
  };
  
  const saveRules = async (updatedRules) => {
    setIsSaving(true);
    try {
      const voiceRef = doc(db, 'voices', voice.id);
      await updateDoc(voiceRef, {
        customRules: updatedRules,
        rulesUpdatedAt: new Date().toISOString()
      });
      
      if (onUpdate) {
        onUpdate({ ...voice, customRules: updatedRules });
      }
    } catch (error) {
      console.error('Error saving rules:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Group rules by category
  const groupedRules = [...rules, ...coachingRules].reduce((acc, rule, index) => {
    const category = rule.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ...rule, index, isCoaching: rule.question !== undefined });
    return acc;
  }, {});
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Voice Rules & Guidelines</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
            Specific do's and don'ts that override general instructions
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          variant="primary"
          size="sm"
        >
          Add Rule
        </Button>
      </div>
      
      {/* Info box explaining rules vs instructions */}
      <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div className="text-sm">
            <p className="font-medium mb-1">Rules vs Instructions</p>
            <p className="text-surface-700 dark:text-surface-300">
              <strong>Instructions:</strong> Set the overall tone (e.g., "Be professional and friendly")
              <br />
              <strong>Rules:</strong> Specific requirements (e.g., "Never use exclamation points")
            </p>
          </div>
        </div>
      </div>
      
      {/* Add new rule form */}
      {isAdding && (
        <div className="mb-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <TextArea
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Enter a rule or guideline for this voice (e.g., 'Always use please and thank you', 'Never start with Hey', etc.)"
            rows={3}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={addRule} disabled={!newRule.trim()}>
              Save Rule
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewRule('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Rules by category */}
      <div className="space-y-6">
        {Object.entries(groupedRules).map(([category, categoryRules]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{categories[category]?.icon || '📝'}</span>
              <h4 className="font-medium text-surface-900 dark:text-surface-100">
                {categories[category]?.name || category}
              </h4>
              <Badge variant="secondary" size="sm">
                {categoryRules.length}
              </Badge>
            </div>
            
            <div className="space-y-2 ml-7">
              {categoryRules.map((rule) => (
                <div
                  key={`${rule.isCoaching ? 'coaching' : 'custom'}-${rule.index}`}
                  className={`p-3 rounded-lg border transition-all ${
                    rule.enabled !== false
                      ? 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700'
                      : 'bg-surface-50 dark:bg-surface-900 border-surface-200/50 dark:border-surface-700/50 opacity-50'
                  }`}
                >
                  {rule.isCoaching ? (
                    // Coaching rule display
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                            {rule.question}
                          </p>
                          <p className="text-sm text-surface-900 dark:text-surface-100 mt-1">
                            {rule.answer}
                          </p>
                        </div>
                        <Badge variant="primary" size="sm">
                          Learned
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    // Custom rule display
                    <div>
                      {editingIndex === rule.index ? (
                        <div className="flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => editRule(rule.index)}
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditValue('');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-surface-900 dark:text-surface-100 flex-1">
                            {rule.content}
                          </p>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => toggleRule(rule.index)}
                              className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
                            >
                              {rule.enabled !== false ? '✓' : '○'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingIndex(rule.index);
                                setEditValue(rule.content);
                              }}
                              className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteRule(rule.index)}
                              className="text-error-500 hover:text-error-700"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {isSaving && (
        <div className="text-center mt-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">Saving...</p>
        </div>
      )}
    </Card>
  );
}