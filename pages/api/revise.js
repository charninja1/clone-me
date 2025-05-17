// pages/api/revise.js
import { db } from "../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { analyzeEmailPatterns, generateStyleInstructions } from "../../lib/emailPatterns";
import { generateVarietyPatterns } from "../../lib/personalityVarieties";

// Helper function to generate human-like revision instructions
function generateHumanRevisionInstructions(personality, feedback) {
  const instructions = [];
  
  // Analyze feedback for specific patterns
  const feedbackLower = feedback.toLowerCase();
  
  if (feedbackLower.includes('formal') || feedbackLower.includes('casual')) {
    if (feedbackLower.includes('too formal')) {
      instructions.push("Loosen up the language - use more contractions and conversational phrases");
      instructions.push("Replace formal phrases with everyday alternatives");
    } else if (feedbackLower.includes('too casual')) {
      instructions.push("Slightly elevate the language while keeping it human");
      instructions.push("Remove slang but keep contractions for naturalness");
    }
  }
  
  if (feedbackLower.includes('short') || feedbackLower.includes('long')) {
    if (feedbackLower.includes('too short')) {
      instructions.push("Expand naturally with context or examples");
      instructions.push("Add personal touches or explanations where appropriate");
    } else if (feedbackLower.includes('too long')) {
      instructions.push("Trim excess but keep the human voice");
      instructions.push("Make cuts that feel natural, not mechanical");
    }
  }
  
  // Handle emoji-related feedback
  if (feedbackLower.includes('emoji') || feedbackLower.includes('emojis')) {
    instructions.push("Remove ALL emojis from the email - real people rarely use them in emails");
    instructions.push("Focus on expressing warmth and personality through word choice, not emojis");
  }
  
  // Handle artificial/AI-like feedback
  if (feedbackLower.includes('artificial') || feedbackLower.includes('ai-like') || feedbackLower.includes('sounds ai')) {
    instructions.push("Make the language more natural and conversational");
    instructions.push("Remove any overly perfect grammar - humans make minor mistakes");
    instructions.push("Vary sentence structure more naturally");
    instructions.push("Remove emojis if present - they often make text seem artificial");
    instructions.push("Use more natural transitions and phrases");
  }
  
  // Personality-based adjustments
  if (personality.warmth > 60) {
    instructions.push("Maintain warmth through word choice, not just added phrases");
  }
  
  if (personality.formality < 40) {
    instructions.push("Keep the casual tone even when making requested changes");
  }
  
  return instructions.length > 0 ? '\n' + instructions.join('\n') : '';
}

export default async function handler(req, res) {
  const { originalEmail, feedback, userId, voiceId } = req.body;

  try {
    // Get user information from Firestore
    let firstName = "";
    let lastName = "";
    let fullName = "";
    
    if (userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        firstName = userData.firstName || "";
        lastName = userData.lastName || "";
        fullName = `${firstName} ${lastName}`.trim();
      }
    }
    
    // If no user data found, use a fallback name
    if (!fullName) {
      fullName = "User";
    }
    
    // Get voice information if provided
    let voiceInstructions = "Make it polite, casual, direct, and not too formal.";
    let feedbackHistory = [];
    let voiceData = null;
    
    if (voiceId) {
      const voiceDoc = await getDoc(doc(db, "voices", voiceId));
      if (voiceDoc.exists()) {
        voiceData = voiceDoc.data();
        voiceInstructions = voiceData.instructions || voiceInstructions;
        feedbackHistory = voiceData.feedbackMemory || [];
        
        // Get custom rules and coaching rules
        const customRules = voiceData.customRules || [];
        const coachingRules = voiceData.coachingRules || [];
      }
    }
    
    // Extract patterns from sample emails
    let writingPatterns = "";
    let styleInstructions = "";
    if (voiceData?.sampleEmails?.length > 0) {
      const patterns = analyzeEmailPatterns(voiceData.sampleEmails);
      styleInstructions = generateStyleInstructions(patterns).join('\n');
      
      writingPatterns = `
Maintain the user's writing patterns from these examples:
${styleInstructions}

Actual email examples:
${voiceData.sampleEmails.map((email, i) => `Sample ${i + 1}: ${email.substring(0, 200)}...`).join('\n')}
`;
    }
    
    // Generate human-like instructions based on personality
    const personality = voiceData?.personality || {
      formality: 50,
      warmth: 50,
      detail: 50,
      emotion: 50
    };
    const humanInstructions = generateHumanRevisionInstructions(personality, feedback);
    
    // Generate variety patterns for natural variations
    const varietyPatterns = generateVarietyPatterns(personality);
    const varietyInstructions = `
Apply these natural variations to maintain human authenticity:
- Openings: ${varietyPatterns.openings.join(', ')}
- Closings: ${varietyPatterns.closings.join(', ')}
- Transitions: ${varietyPatterns.transitions.join(', ')}
- Acknowledgments: ${varietyPatterns.acknowledgments.join(', ')}

Vary your language naturally - don't use the same patterns repeatedly.
`;

    // Format feedback history for the prompt
    let feedbackSection = "";
    if (feedbackHistory.length > 0) {
      const formattedFeedback = feedbackHistory.map(f => {
        if (f.type === 'detailed' && f.detailedFeedback) {
          return `- ${f.detailedFeedback}`;
        } else if (f.label) {
          return `- ${f.label}: User indicated this about the email`;
        }
        return null;
      }).filter(Boolean);
      
      if (formattedFeedback.length > 0) {
        feedbackSection = `
IMPORTANT: Remember to apply these past learnings from the user's feedback:
${formattedFeedback.join('\n')}
`;
      }
    }

    // Format custom rules and coaching rules
    let rulesSection = "";
    const allRules = [];
    
    // Add enabled custom rules
    if (customRules && customRules.length > 0) {
      customRules.filter(rule => rule.enabled !== false).forEach(rule => {
        allRules.push(`- ${rule.content}`);
      });
    }
    
    // Add coaching rules
    if (coachingRules && coachingRules.length > 0) {
      coachingRules.forEach(rule => {
        if (rule.question && rule.answer) {
          allRules.push(`- When asked "${rule.question}", the user answered: "${rule.answer}"`);
        }
      });
    }
    
    if (allRules.length > 0) {
      rulesSection = `
IMPORTANT PERSONAL WRITING RULES (follow these strictly):
${allRules.join('\n')}`;
    }
    
    const prompt = `
Revise this email to sound like a real person wrote it, not an AI. Apply the feedback while maintaining human authenticity.

CRITICAL HUMAN-LIKE WRITING RULES:
1. Keep the natural flow and voice from the original
2. Don't over-correct - humans make minor grammar imperfections
3. Use natural transitions, not robotic ones
4. Vary sentence structure organically
5. Apply feedback subtly - don't make it obvious you're following instructions
6. Keep any personal quirks or style from the original
7. Make changes feel natural, not mechanical
8. Do NOT add emojis unless they were in the original email. Real people rarely use emojis in emails.
9. If the user complains about emojis or artificial tone, remove emojis and focus on natural language.

${voiceInstructions}
${humanInstructions}
${varietyInstructions}
${rulesSection}
${writingPatterns}

ORIGINAL EMAIL:
"""${originalEmail}"""

FEEDBACK TO APPLY:
"""${feedback}"""
${feedbackSection}

EMOJI RULE: Do not use emojis unless they appeared in the original email. Most people do not use emojis in professional or casual emails. If feedback mentions the email sounds artificial or AI-like, remove any emojis.

Revise the email now, keeping it authentically human while incorporating the feedback.
Sign as ${fullName}.
`;

    // If no OpenAI API key is configured, use mock data for development
    if (!process.env.OPENAI_API_KEY) {
      console.warn("No OpenAI API key found. Using mock data.");
      return res.status(200).json({ 
        result: `${originalEmail}\n\n(Revised with feedback: ${feedback})\n\nBest regards,\n${fullName}` 
      });
    }

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await completion.json();
    const message = data.choices?.[0]?.message?.content;
    res.status(200).json({ result: message });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
}
