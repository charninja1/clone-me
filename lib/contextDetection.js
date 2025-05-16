// Smart context detection for email generation
export const EMAIL_TYPES = {
  THANK_YOU: 'thank_you',
  REQUEST: 'request',
  FOLLOW_UP: 'follow_up',
  APOLOGY: 'apology',
  INTRODUCTION: 'introduction',
  ANNOUNCEMENT: 'announcement',
  INVITATION: 'invitation',
  CONFIRMATION: 'confirmation',
  GENERAL: 'general'
};

export const RECIPIENT_TYPES = {
  PROFESSOR: 'professor',
  BOSS: 'boss',
  COLLEAGUE: 'colleague',
  CLIENT: 'client',
  FRIEND: 'friend',
  FAMILY: 'family',
  STRANGER: 'stranger',
  SUPPORT: 'support',
  GENERAL: 'general'
};

// Keywords and patterns for email type detection
const emailTypePatterns = {
  [EMAIL_TYPES.THANK_YOU]: {
    keywords: ['thank', 'thanks', 'grateful', 'appreciate', 'gratitude'],
    phrases: ['thank you for', 'thanks for', 'grateful for', 'appreciate your'],
    weight: 1.5
  },
  [EMAIL_TYPES.REQUEST]: {
    keywords: ['request', 'need', 'ask', 'favor', 'help', 'require', 'would like'],
    phrases: ['could you', 'would you', 'can you', 'need your help', 'request for'],
    weight: 1.3
  },
  [EMAIL_TYPES.FOLLOW_UP]: {
    keywords: ['follow', 'following', 'previous', 'earlier', 'last', 'update', 'status'],
    phrases: ['following up', 'follow up on', 'checking in', 'update on', 'status of'],
    weight: 1.4
  },
  [EMAIL_TYPES.APOLOGY]: {
    keywords: ['sorry', 'apologize', 'apology', 'regret', 'mistake', 'error'],
    phrases: ['sorry for', 'apologize for', 'my mistake', 'my apologies'],
    weight: 1.6
  },
  [EMAIL_TYPES.INTRODUCTION]: {
    keywords: ['introduce', 'introduction', 'meet', 'introducing', 'connect'],
    phrases: ['introduce myself', 'introducing myself', 'wanted to connect', 'reaching out'],
    weight: 1.2
  },
  [EMAIL_TYPES.ANNOUNCEMENT]: {
    keywords: ['announce', 'announcement', 'inform', 'notify', 'update', 'news'],
    phrases: ['pleased to announce', 'want to inform', 'exciting news', 'update you'],
    weight: 1.2
  },
  [EMAIL_TYPES.INVITATION]: {
    keywords: ['invite', 'invitation', 'join', 'attend', 'welcome'],
    phrases: ['invite you', 'would like to invite', 'you are invited', 'join us'],
    weight: 1.3
  },
  [EMAIL_TYPES.CONFIRMATION]: {
    keywords: ['confirm', 'confirmation', 'verified', 'received', 'acknowledge'],
    phrases: ['confirm that', 'confirming our', 'acknowledge receipt', 'verify that'],
    weight: 1.4
  }
};

// Recipient detection patterns
const recipientPatterns = {
  [RECIPIENT_TYPES.PROFESSOR]: {
    keywords: ['professor', 'prof', 'dr', 'doctor', 'instructor', 'teacher'],
    contexts: ['class', 'course', 'assignment', 'grade', 'lecture', 'exam'],
    weight: 1.5
  },
  [RECIPIENT_TYPES.BOSS]: {
    keywords: ['boss', 'manager', 'supervisor', 'director', 'ceo', 'lead'],
    contexts: ['work', 'project', 'deadline', 'meeting', 'report', 'team'],
    weight: 1.4
  },
  [RECIPIENT_TYPES.COLLEAGUE]: {
    keywords: ['colleague', 'coworker', 'team member', 'peer'],
    contexts: ['project', 'collaboration', 'team', 'work', 'office'],
    weight: 1.2
  },
  [RECIPIENT_TYPES.CLIENT]: {
    keywords: ['client', 'customer', 'account', 'prospect'],
    contexts: ['service', 'product', 'contract', 'proposal', 'invoice'],
    weight: 1.3
  },
  [RECIPIENT_TYPES.FRIEND]: {
    keywords: ['friend', 'buddy', 'pal', 'mate'],
    contexts: ['hangout', 'weekend', 'party', 'catch up', 'fun'],
    weight: 1.1
  },
  [RECIPIENT_TYPES.FAMILY]: {
    keywords: ['mom', 'dad', 'sister', 'brother', 'family', 'parent'],
    contexts: ['home', 'visit', 'holiday', 'birthday', 'reunion'],
    weight: 1.2
  },
  [RECIPIENT_TYPES.SUPPORT]: {
    keywords: ['support', 'service', 'help desk', 'technical'],
    contexts: ['issue', 'problem', 'bug', 'error', 'assistance'],
    weight: 1.3
  }
};

// Analyze topic to detect email type
export function detectEmailType(topic) {
  const lowerTopic = topic.toLowerCase();
  const scores = {};
  
  // Initialize scores
  Object.keys(EMAIL_TYPES).forEach(type => {
    scores[EMAIL_TYPES[type]] = 0;
  });
  
  // Check each pattern
  Object.entries(emailTypePatterns).forEach(([type, pattern]) => {
    // Check keywords
    pattern.keywords.forEach(keyword => {
      if (lowerTopic.includes(keyword)) {
        scores[type] += pattern.weight;
      }
    });
    
    // Check phrases
    pattern.phrases.forEach(phrase => {
      if (lowerTopic.includes(phrase)) {
        scores[type] += pattern.weight * 1.5; // Phrases are more specific
      }
    });
  });
  
  // Find the highest scoring type
  let maxScore = 0;
  let detectedType = EMAIL_TYPES.GENERAL;
  
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  });
  
  return {
    type: detectedType,
    confidence: maxScore > 0 ? Math.min(maxScore / 5, 1) : 0,
    scores
  };
}

// Analyze topic to detect recipient type
export function detectRecipient(topic) {
  const lowerTopic = topic.toLowerCase();
  const scores = {};
  
  // Initialize scores
  Object.keys(RECIPIENT_TYPES).forEach(type => {
    scores[RECIPIENT_TYPES[type]] = 0;
  });
  
  // Check each pattern
  Object.entries(recipientPatterns).forEach(([type, pattern]) => {
    // Check keywords
    pattern.keywords.forEach(keyword => {
      if (lowerTopic.includes(keyword)) {
        scores[type] += pattern.weight * 2; // Direct mentions are strong indicators
      }
    });
    
    // Check contexts
    pattern.contexts.forEach(context => {
      if (lowerTopic.includes(context)) {
        scores[type] += pattern.weight;
      }
    });
  });
  
  // Find the highest scoring type
  let maxScore = 0;
  let detectedRecipient = RECIPIENT_TYPES.GENERAL;
  
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedRecipient = type;
    }
  });
  
  return {
    type: detectedRecipient,
    confidence: maxScore > 0 ? Math.min(maxScore / 5, 1) : 0,
    scores
  };
}

// Recommend voice based on email type and recipient
export function recommendVoice(emailType, recipientType, availableVoices) {
  // Define ideal voice characteristics for different contexts
  const voicePreferences = {
    [EMAIL_TYPES.THANK_YOU]: {
      formality: recipientType === RECIPIENT_TYPES.PROFESSOR ? 70 : 50,
      warmth: 80,
      emotion: 70
    },
    [EMAIL_TYPES.REQUEST]: {
      formality: recipientType === RECIPIENT_TYPES.BOSS ? 60 : 40,
      warmth: 60,
      emotion: 40
    },
    [EMAIL_TYPES.APOLOGY]: {
      formality: 50,
      warmth: 70,
      emotion: 80
    },
    [EMAIL_TYPES.INTRODUCTION]: {
      formality: recipientType === RECIPIENT_TYPES.STRANGER ? 70 : 50,
      warmth: 60,
      emotion: 50
    }
  };
  
  // Recipient-based adjustments
  const recipientAdjustments = {
    [RECIPIENT_TYPES.PROFESSOR]: { formality: +20 },
    [RECIPIENT_TYPES.BOSS]: { formality: +10 },
    [RECIPIENT_TYPES.FRIEND]: { formality: -30, warmth: +20 },
    [RECIPIENT_TYPES.FAMILY]: { formality: -20, warmth: +30 },
    [RECIPIENT_TYPES.CLIENT]: { formality: +10, warmth: +10 }
  };
  
  // Get base preferences
  let targetCharacteristics = voicePreferences[emailType] || {
    formality: 50,
    warmth: 50,
    emotion: 50
  };
  
  // Apply recipient adjustments
  const adjustments = recipientAdjustments[recipientType];
  if (adjustments) {
    targetCharacteristics = {
      formality: Math.max(0, Math.min(100, targetCharacteristics.formality + (adjustments.formality || 0))),
      warmth: Math.max(0, Math.min(100, targetCharacteristics.warmth + (adjustments.warmth || 0))),
      emotion: Math.max(0, Math.min(100, targetCharacteristics.emotion + (adjustments.emotion || 0)))
    };
  }
  
  // Find closest matching voice
  let bestMatch = null;
  let bestScore = Infinity;
  
  availableVoices.forEach(voice => {
    if (!voice.personality) return;
    
    const score = 
      Math.abs(voice.personality.formality - targetCharacteristics.formality) +
      Math.abs(voice.personality.warmth - targetCharacteristics.warmth) +
      Math.abs(voice.personality.emotion - targetCharacteristics.emotion);
    
    if (score < bestScore) {
      bestScore = score;
      bestMatch = voice;
    }
  });
  
  return {
    recommendedVoice: bestMatch,
    matchScore: bestMatch ? 1 - (bestScore / 300) : 0, // Normalize to 0-1
    targetCharacteristics
  };
}

// Main context analysis function
export function analyzeContext(topic, availableVoices) {
  const emailType = detectEmailType(topic);
  const recipient = detectRecipient(topic);
  const voiceRecommendation = recommendVoice(
    emailType.type,
    recipient.type,
    availableVoices
  );
  
  return {
    emailType,
    recipient,
    voiceRecommendation,
    suggestions: generateSuggestions(emailType, recipient)
  };
}

// Generate helpful suggestions based on context
function generateSuggestions(emailType, recipient) {
  const suggestions = [];
  
  // Email type specific suggestions
  if (emailType.type === EMAIL_TYPES.THANK_YOU && emailType.confidence > 0.7) {
    suggestions.push("Be specific about what you're thankful for");
    suggestions.push("Consider offering to reciprocate");
  }
  
  if (emailType.type === EMAIL_TYPES.REQUEST && emailType.confidence > 0.7) {
    suggestions.push("Be clear about what you need and when");
    suggestions.push("Explain why you're making this request");
  }
  
  // Recipient specific suggestions
  if (recipient.type === RECIPIENT_TYPES.PROFESSOR && recipient.confidence > 0.7) {
    suggestions.push("Use formal salutation (Dear Professor X)");
    suggestions.push("Be concise and respectful of their time");
  }
  
  if (recipient.type === RECIPIENT_TYPES.CLIENT && recipient.confidence > 0.7) {
    suggestions.push("Maintain professional tone");
    suggestions.push("Focus on value and benefits");
  }
  
  return suggestions;
}

// Time-based context detection
export function getTimeBasedContext() {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  
  // Business hours (Mon-Fri, 9-5)
  const isBusinessHours = dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17;
  
  return {
    isBusinessHours,
    suggestedFormality: isBusinessHours ? 60 : 40,
    greeting: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  };
}