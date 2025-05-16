// Generate variety patterns based on personality for more human-like output
export function generateVarietyPatterns(personality = {}) {
  // Default personality values if not provided
  const formality = personality.formality || 50;
  const warmth = personality.warmth || 50;
  const detail = personality.detail || 50;
  const emotion = personality.emotion || 50;
  
  // Generate variations for different aspects
  const patterns = {
    openings: generateOpeningVariations(formality, warmth),
    closings: generateClosingVariations(formality, warmth),
    transitions: generateTransitionVariations(formality),
    emphasis: generateEmphasisPatterns(emotion),
    fillers: generateFillerPatterns(formality),
    acknowledgments: generateAcknowledgmentPatterns(warmth),
    uncertaintyMarkers: generateUncertaintyMarkers(formality),
    personalTouches: generatePersonalTouches(warmth, emotion)
  };
  
  return patterns;
}

function generateOpeningVariations(formality, warmth) {
  const variations = [];
  
  if (formality < 30) {
    variations.push(
      "Hey there",
      "Hi",
      "Hey",
      "What's up",
      "Yo"
    );
  } else if (formality < 60) {
    variations.push(
      "Hi there",
      "Hello",
      "Hi",
      "Good morning/afternoon",
      "Hey"
    );
  } else {
    variations.push(
      "Dear [Name]",
      "Good morning/afternoon",
      "Hello",
      "Greetings"
    );
  }
  
  if (warmth > 70) {
    variations.push(
      "I hope you're doing well",
      "Hope this finds you well",
      "Hope you're having a great day",
      "Trust you're doing well"
    );
  }
  
  return variations;
}

function generateClosingVariations(formality, warmth) {
  const variations = [];
  
  if (formality < 30) {
    variations.push(
      "Thanks!",
      "Cheers",
      "Talk soon",
      "Later",
      "Thanks a bunch"
    );
  } else if (formality < 60) {
    variations.push(
      "Best regards",
      "Best",
      "Thanks",
      "Thank you",
      "All the best",
      "Kind regards"
    );
  } else {
    variations.push(
      "Sincerely",
      "Best regards",
      "Kind regards",
      "Respectfully",
      "With regards"
    );
  }
  
  if (warmth > 70) {
    variations.push(
      "Warmly",
      "Take care",
      "Stay well",
      "Looking forward to hearing from you"
    );
  }
  
  return variations;
}

function generateTransitionVariations(formality) {
  if (formality < 30) {
    return [
      "So",
      "Anyway",
      "BTW",
      "Also",
      "Oh and",
      "Just FYI"
    ];
  } else if (formality < 60) {
    return [
      "Additionally",
      "Also",
      "By the way",
      "On a related note",
      "Moving on",
      "Furthermore"
    ];
  } else {
    return [
      "Moreover",
      "Furthermore",
      "Additionally",
      "In addition",
      "Subsequently",
      "With regard to"
    ];
  }
}

function generateEmphasisPatterns(emotion) {
  if (emotion > 70) {
    return {
      excited: ["really", "totally", "absolutely", "definitely", "so"],
      caps: ["AMAZING", "WOW", "GREAT", "PERFECT"],
      punctuation: ["!!", "!!!", "!?"],
      emoticons: [":)", ":D", "😊", "👍", "🎉"]
    };
  } else if (emotion > 30) {
    return {
      excited: ["quite", "very", "really", "certainly"],
      caps: ["IMPORTANT", "NOTE"],
      punctuation: ["!", "."],
      emoticons: [":)", "👍"]
    };
  } else {
    return {
      excited: ["rather", "quite", "somewhat"],
      caps: [],
      punctuation: ["."],
      emoticons: []
    };
  }
}

function generateFillerPatterns(formality) {
  if (formality < 30) {
    return [
      "like",
      "you know",
      "I mean",
      "kinda",
      "sort of",
      "basically",
      "literally"
    ];
  } else if (formality < 60) {
    return [
      "essentially",
      "basically",
      "in essence",
      "so to speak",
      "if you will"
    ];
  } else {
    return [
      "indeed",
      "certainly",
      "evidently",
      "naturally",
      "undoubtedly"
    ];
  }
}

function generateAcknowledgmentPatterns(warmth) {
  if (warmth > 70) {
    return [
      "I really appreciate",
      "Thanks so much for",
      "I'm grateful for",
      "It means a lot that",
      "I truly value"
    ];
  } else if (warmth > 30) {
    return [
      "Thank you for",
      "I appreciate",
      "Thanks for",
      "I acknowledge",
      "I recognize"
    ];
  } else {
    return [
      "Noted",
      "Understood",
      "Acknowledged",
      "Received",
      "Thank you"
    ];
  }
}

function generateUncertaintyMarkers(formality) {
  if (formality < 30) {
    return [
      "maybe",
      "probably",
      "I think",
      "I guess",
      "not sure but",
      "could be"
    ];
  } else if (formality < 60) {
    return [
      "perhaps",
      "possibly",
      "it seems",
      "I believe",
      "it appears",
      "might be"
    ];
  } else {
    return [
      "it would appear",
      "it is possible that",
      "one might consider",
      "it could be argued",
      "potentially"
    ];
  }
}

function generatePersonalTouches(warmth, emotion) {
  const touches = [];
  
  if (warmth > 70 && emotion > 70) {
    touches.push(
      "I'm excited to",
      "Looking forward to",
      "Can't wait to",
      "Would love to",
      "Really hoping we can"
    );
  } else if (warmth > 50 || emotion > 50) {
    touches.push(
      "I'd be happy to",
      "It would be great to",
      "I look forward to",
      "Would be nice to",
      "Hoping to"
    );
  } else {
    touches.push(
      "I would like to",
      "It would be beneficial to",
      "I am interested in",
      "Would appreciate",
      "Please consider"
    );
  }
  
  return touches;
}

// Helper function to randomly select from variations
export function selectVariation(variations) {
  if (!variations || variations.length === 0) return '';
  return variations[Math.floor(Math.random() * variations.length)];
}

// Generate natural human variations for email text
export function applyPersonalityVariations(text, personality) {
  const patterns = generateVarietyPatterns(personality);
  let modifiedText = text;
  
  // Add random filler words based on personality
  if (Math.random() < 0.3 && personality.formality < 50) {
    const filler = selectVariation(patterns.fillers);
    const sentences = modifiedText.split('. ');
    const randomIndex = Math.floor(Math.random() * sentences.length);
    sentences[randomIndex] = sentences[randomIndex].replace(' ', ` ${filler} `, 1);
    modifiedText = sentences.join('. ');
  }
  
  // Add uncertainty markers randomly
  if (Math.random() < 0.2) {
    const marker = selectVariation(patterns.uncertaintyMarkers);
    const sentences = modifiedText.split('. ');
    const randomIndex = Math.floor(Math.random() * sentences.length);
    sentences[randomIndex] = marker + ' ' + sentences[randomIndex];
    modifiedText = sentences.join('. ');
  }
  
  // Apply emphasis patterns
  if (personality.emotion > 50 && Math.random() < 0.3) {
    const emphasis = patterns.emphasis;
    const excitedWord = selectVariation(emphasis.excited);
    modifiedText = modifiedText.replace(/very|quite/, excitedWord, 1);
  }
  
  return modifiedText;
}