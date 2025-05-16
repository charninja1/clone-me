// Analyze email patterns to extract unique human characteristics
export function analyzeEmailPatterns(sampleEmails) {
  if (!sampleEmails || sampleEmails.length === 0) return {};
  
  const patterns = {
    greetings: [],
    signoffs: [],
    transitions: [],
    sentenceStarters: [],
    commonPhrases: [],
    punctuationStyle: {},
    averageSentenceLength: 0,
    paragraphStyle: '',
    emoticons: [],
    capitalizations: []
  };
  
  sampleEmails.forEach(email => {
    // Extract greetings (first line patterns)
    const lines = email.split('\n').filter(line => line.trim());
    if (lines[0]) {
      const greeting = lines[0].match(/^(Hi|Hey|Hello|Dear|Good\s+\w+|Greetings)[^,]*,?/i);
      if (greeting) patterns.greetings.push(greeting[0]);
    }
    
    // Extract signoffs (last few lines)
    const lastLines = lines.slice(-3);
    lastLines.forEach(line => {
      if (line.match(/(Thanks|Best|Regards|Sincerely|Cheers|Talk\s+soon)/i)) {
        patterns.signoffs.push(line);
      }
    });
    
    // Analyze sentence patterns
    const sentences = email.match(/[^.!?]+[.!?]+/g) || [];
    
    // Common sentence starters
    sentences.forEach(sentence => {
      const starter = sentence.trim().split(' ')[0];
      if (starter && starter.length > 2) {
        patterns.sentenceStarters.push(starter);
      }
    });
    
    // Check for emoticons/emojis
    const emoticons = email.match(/[:;]=?[-]?[)DPO(]/g) || [];
    const emojis = email.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu) || [];
    patterns.emoticons.push(...emoticons, ...emojis);
    
    // Punctuation style
    patterns.punctuationStyle.exclamations = (email.match(/!/g) || []).length;
    patterns.punctuationStyle.questions = (email.match(/\?/g) || []).length;
    patterns.punctuationStyle.ellipses = (email.match(/\.\.\./g) || []).length;
    patterns.punctuationStyle.dashes = (email.match(/--|-/g) || []).length;
    
    // Common phrases and transitions
    const commonTransitions = [
      'By the way', 'Speaking of', 'Also', 'Oh and', 'One more thing',
      'Just to let you know', 'Quick question', 'Real quick',
      'Hope this helps', 'Let me know', 'Feel free to'
    ];
    
    commonTransitions.forEach(transition => {
      if (email.toLowerCase().includes(transition.toLowerCase())) {
        patterns.transitions.push(transition);
      }
    });
    
    // Unique capitalizations (like "REALLY" or "SO")
    const capsWords = email.match(/\b[A-Z]{2,}\b/g) || [];
    patterns.capitalizations.push(...capsWords.filter(word => 
      !['RE:', 'FW:', 'CC:', 'BCC:'].includes(word)
    ));
    
    // Average sentence length
    if (sentences.length > 0) {
      const avgLength = sentences.reduce((sum, sent) => 
        sum + sent.split(' ').length, 0) / sentences.length;
      patterns.averageSentenceLength = avgLength;
    }
    
    // Paragraph style (short vs long paragraphs)
    const paragraphs = email.split(/\n\n+/);
    const avgParagraphLength = paragraphs.reduce((sum, p) => 
      sum + p.split(' ').length, 0) / paragraphs.length;
    patterns.paragraphStyle = avgParagraphLength < 50 ? 'short' : 'long';
  });
  
  // Deduplicate and count frequencies
  patterns.greetings = [...new Set(patterns.greetings)];
  patterns.signoffs = [...new Set(patterns.signoffs)];
  patterns.sentenceStarters = getMostCommon(patterns.sentenceStarters, 5);
  patterns.transitions = [...new Set(patterns.transitions)];
  patterns.commonPhrases = [...new Set(patterns.commonPhrases)];
  patterns.emoticons = [...new Set(patterns.emoticons)];
  patterns.capitalizations = [...new Set(patterns.capitalizations)];
  
  return patterns;
}

// Get most common items from an array
function getMostCommon(arr, n = 5) {
  const frequency = {};
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, n)
    .map(([item]) => item);
}

// Generate style instructions from patterns
export function generateStyleInstructions(patterns) {
  const instructions = [];
  
  if (patterns.greetings?.length > 0) {
    instructions.push(`Use greetings like: ${patterns.greetings.join(', ')}`);
  }
  
  if (patterns.signoffs?.length > 0) {
    instructions.push(`End emails with signoffs like: ${patterns.signoffs.join(', ')}`);
  }
  
  if (patterns.emoticons?.length > 0) {
    instructions.push(`Occasionally use emoticons/emojis like: ${patterns.emoticons.join(' ')}`);
  }
  
  if (patterns.transitions?.length > 0) {
    instructions.push(`Use transition phrases like: ${patterns.transitions.join(', ')}`);
  }
  
  if (patterns.punctuationStyle?.exclamations > 2) {
    instructions.push(`Use exclamation points naturally when expressing enthusiasm`);
  }
  
  if (patterns.punctuationStyle?.ellipses > 0) {
    instructions.push(`Sometimes use ellipses (...) for trailing thoughts`);
  }
  
  if (patterns.capitalizations?.length > 0) {
    instructions.push(`Occasionally capitalize words for emphasis like: ${patterns.capitalizations.join(', ')}`);
  }
  
  if (patterns.averageSentenceLength < 10) {
    instructions.push(`Keep sentences short and punchy`);
  } else if (patterns.averageSentenceLength > 20) {
    instructions.push(`Use longer, more detailed sentences with multiple clauses`);
  }
  
  if (patterns.paragraphStyle === 'short') {
    instructions.push(`Keep paragraphs brief - usually 1-3 sentences`);
  } else {
    instructions.push(`Write longer paragraphs with full context`);
  }
  
  return instructions;
}