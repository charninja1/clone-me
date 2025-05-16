import { db } from "../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { analyzeEmailPatterns, generateStyleInstructions } from "../../lib/emailPatterns";
import { generateVarietyPatterns } from "../../lib/personalityVarieties";

export default async function handler(req, res) {
  const { topic, userId, voiceId, examples = "[None yet]" } = req.body;

  // Helper function to generate human-like instructions
  function generateHumanInstructions(personality) {
    const instructions = [];
    
    // Formality variations
    if (personality.formality < 30) {
      instructions.push("Use very casual language with fragments, slang, and informal expressions");
      instructions.push("Start sentences informally (Yeah, Nah, Honestly)");
      instructions.push("Use lots of contractions and abbreviations");
    } else if (personality.formality > 70) {
      instructions.push("Maintain professionalism but still sound human - not robotic");
      instructions.push("Use some contractions to sound natural");
    }
    
    // Warmth variations
    if (personality.warmth > 70) {
      instructions.push("Include personal touches and friendly asides");
      instructions.push("Use exclamation points naturally (but not excessively)");
      instructions.push("Add phrases like 'Hope you're doing well' but vary them");
    }
    
    // Detail variations
    if (personality.detail < 30) {
      instructions.push("Keep it brief and punchy - like texting");
      instructions.push("Use incomplete sentences when natural");
    } else if (personality.detail > 70) {
      instructions.push("Elaborate naturally with examples and context");
      instructions.push("Use parenthetical asides (like this) for extra thoughts");
    }
    
    // Emotion variations
    if (personality.emotion > 70) {
      instructions.push("Show genuine emotion through word choice");
      instructions.push("Use emphatic language naturally");
    } else if (personality.emotion < 30) {
      instructions.push("Keep emotions subtle and matter-of-fact");
    }
    
    return instructions.join('\n');
  }
  
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
      }
    }

    // Format feedback history for the prompt
    let feedbackSection = "";
    if (feedbackHistory.length > 0) {
      feedbackSection = `
Important feedback to remember:
${feedbackHistory.map(f => `- "${f.feedback}"`).join('\n')}
`;
    }
    
    // Extract patterns from sample emails
    let writingPatterns = "";
    let styleInstructions = "";
    if (voiceData?.sampleEmails?.length > 0) {
      const patterns = analyzeEmailPatterns(voiceData.sampleEmails);
      styleInstructions = generateStyleInstructions(patterns).join('\n');
      
      writingPatterns = `
Analyze and mimic these specific patterns from the user's emails:
${styleInstructions}

Actual email examples:
${voiceData.sampleEmails.map((email, i) => `Sample ${i + 1}: ${email.substring(0, 200)}...`).join('\n')}
`;
    }
    
    // Human-like writing instructions based on personality
    const personality = voiceData?.personality || {
      formality: 50,
      warmth: 50,
      detail: 50,
      emotion: 50
    };
    const humanInstructions = generateHumanInstructions(personality);
    
    // Generate variety patterns for natural variations
    const varietyPatterns = generateVarietyPatterns(personality);
    const varietyInstructions = `
Use these natural variations to sound human:
- Openings: ${varietyPatterns.openings.join(', ')}
- Closings: ${varietyPatterns.closings.join(', ')}
- Transitions: ${varietyPatterns.transitions.join(', ')}
- Acknowledgments: ${varietyPatterns.acknowledgments.join(', ')}
- Personal touches: ${varietyPatterns.personalTouches.join(', ')}

Randomly vary your language patterns - don't always use the same phrases.
`;

    const prompt = `
You are writing an email as ${fullName}. Your goal is to sound exactly like a human, not an AI.

CRITICAL: Make this email INDISTINGUISHABLE from human writing by:
1. Varying sentence lengths (mix short and long)
2. Using natural, conversational language
3. Including personal touches and natural transitions
4. Avoiding overly perfect grammar - write how people actually write
5. Using contractions naturally (I'm, don't, can't)
6. Starting sentences with conjunctions sometimes (But, And, So)
7. Using fragments when natural
8. Avoiding AI patterns like numbered lists, excessive politeness, or over-explaining

${voiceInstructions}
${humanInstructions}
${varietyInstructions}
${writingPatterns}

Context for this email: "${topic}"

Previously approved emails in this style:
${examples}
${feedbackSection}

Write the email now. Sound like a real person, not an AI assistant.
`;

    // If no OpenAI API key is configured, use mock data for development
    if (!process.env.OPENAI_API_KEY) {
      console.warn("No OpenAI API key found. Using mock data.");
      const mockEmail = `
      Hello Professor,

      I hope you're doing well. I had a question about the homework due this week. I wanted to ask if we're allowed to use external libraries for the final part of the assignment.

      Thanks!
      ${fullName}
      `;
      return res.status(200).json({ result: mockEmail });
    }

    // Otherwise, use the real OpenAI API
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Using 3.5-turbo as it's more widely available than 4.1
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!completion.ok) {
      const errorData = await completion.json();
      console.error("OpenAI API Error:", errorData);
      return res.status(completion.status).json({ 
        error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` 
      });
    }

    const data = await completion.json();
    const message = data.choices?.[0]?.message?.content || "No message found";
    return res.status(200).json({ result: message });
  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: "Failed to generate email: " + err.message });
  }
}