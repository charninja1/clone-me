import { db } from "../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { analyzeEmailPatterns, generateStyleInstructions } from "../../lib/emailPatterns";
import { generateVarietyPatterns } from "../../lib/personalityVarieties";
import { detectEmailType, detectRecipient, EMAIL_TYPES, RECIPIENT_TYPES } from "../../lib/contextDetection";

export default async function handler(req, res) {
  const { topic, userId, voiceId, examples = "[None yet]" } = req.body;
  
  // Detect context from topic
  const emailTypeDetection = detectEmailType(topic);
  const recipientDetection = detectRecipient(topic);

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
      try {
        const voiceDoc = await getDoc(doc(db, "voices", voiceId));
        if (voiceDoc.exists()) {
          voiceData = voiceDoc.data();
          voiceInstructions = voiceData.instructions || voiceInstructions;
          feedbackHistory = voiceData.feedbackMemory || [];
          
          // Ensure feedbackHistory is an array
          if (!Array.isArray(feedbackHistory)) {
            console.warn("feedbackMemory is not an array, resetting to empty array");
            feedbackHistory = [];
          }
        }
      } catch (error) {
        console.error("Error fetching voice data:", error);
      }
    }

    // Format feedback history for the prompt
    let feedbackSection = "";
    if (feedbackHistory.length > 0) {
      try {
        const formattedFeedback = feedbackHistory.map(f => {
          // Handle different feedback structures
          if (!f || typeof f !== 'object') {
            console.warn("Invalid feedback item:", f);
            return null;
          }
          
          if (f.type === 'detailed' && f.detailedFeedback) {
            return `- ${f.detailedFeedback}`;
          } else if (f.label) {
            return `- ${f.label}: User indicated this about the email`;
          }
          return null;
        }).filter(Boolean);
        
        if (formattedFeedback.length > 0) {
          feedbackSection = `
Important feedback to remember from past emails:
${formattedFeedback.join('\n')}

Apply this feedback: adjust tone, style, vocabulary, and structure based on what the user has indicated.
`;
        }
      } catch (error) {
        console.error("Error formatting feedback:", error);
        console.error("feedbackHistory:", feedbackHistory);
      }
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
    
    // Add context-specific instructions based on detected email type
    let contextInstructions = '';
    
    if (emailTypeDetection.confidence > 0.5) {
      const contextGuidelines = {
        [EMAIL_TYPES.THANK_YOU]: `
This is a THANK YOU email. Key elements:
- Express genuine gratitude for specific actions/things
- Be specific about what you're thankful for
- Consider offering to reciprocate or help in return
- Keep it warm and sincere`,
        
        [EMAIL_TYPES.REQUEST]: `
This is a REQUEST email. Key elements:
- State your request clearly in the first paragraph
- Explain why you need this (provide context)
- Be respectful of their time
- Include a specific deadline if applicable
- Express appreciation in advance`,
        
        [EMAIL_TYPES.FOLLOW_UP]: `
This is a FOLLOW-UP email. Key elements:
- Reference the previous interaction clearly
- Provide a brief reminder of context
- State the purpose of following up
- Include next steps or actions needed
- Be politely persistent`,
        
        [EMAIL_TYPES.APOLOGY]: `
This is an APOLOGY email. Key elements:
- Accept responsibility clearly
- Express genuine regret
- Acknowledge the impact on the recipient
- Explain how you'll prevent it from happening again
- Don't make excuses`,
        
        [EMAIL_TYPES.INTRODUCTION]: `
This is an INTRODUCTION email. Key elements:
- Briefly introduce yourself and your background
- Explain why you're reaching out
- Mention any mutual connections
- State what you're hoping to achieve
- Include a clear call-to-action`
      };
      
      contextInstructions = contextGuidelines[emailTypeDetection.type] || '';
    }
    
    // Add recipient-specific adjustments
    let recipientInstructions = '';
    
    if (recipientDetection.confidence > 0.5) {
      const recipientGuidelines = {
        [RECIPIENT_TYPES.PROFESSOR]: `
Writing to a PROFESSOR:
- Use formal salutation (Dear Professor [Name])
- Be concise and respect their time
- Maintain academic professionalism
- Reference course/class if relevant`,
        
        [RECIPIENT_TYPES.BOSS]: `
Writing to your BOSS:
- Maintain professional tone
- Be clear about work-related matters
- Show respect for hierarchy
- Focus on business value and outcomes`,
        
        [RECIPIENT_TYPES.CLIENT]: `
Writing to a CLIENT:
- Focus on their needs and benefits
- Maintain professionalism with warmth
- Be clear about deliverables
- Show appreciation for their business`,
        
        [RECIPIENT_TYPES.FRIEND]: `
Writing to a FRIEND:
- Use casual, conversational tone
- Include personal references
- Be yourself - show personality
- Use inside jokes or shared experiences if relevant`
      };
      
      recipientInstructions = recipientGuidelines[recipientDetection.type] || '';
    }

    let samplesSection = "";
    if (voiceData?.sampleEmails?.length > 0) {
      try {
        samplesSection = `CRITICAL INSTRUCTION: The user has provided sample emails that show EXACTLY how they write. You MUST mimic their style PRECISELY. Their emails are:
${voiceData.sampleEmails.map((email, i) => `
Sample ${i + 1}: "${email}"
`).join('\n')}

If their samples are extremely casual/brief (like "hi whats up"), you MUST write just as casually and briefly. Do NOT add formality, politeness, or structure they don't use.`;
      } catch (error) {
        console.error("Error formatting sample emails:", error);
      }
    }
    
    const prompt = `
You are writing an email as ${fullName}. 

${samplesSection}

${writingPatterns}

Your goal is to sound exactly like the samples provided, NOT like a typical professional email.

${voiceInstructions}
${humanInstructions}
${varietyInstructions}
${contextInstructions}
${recipientInstructions}

Context for this email: "${topic}"

${feedbackSection}

Write the email now. Match the exact style and brevity of the samples provided.

Also, provide a concise, appropriate subject line for this email.

Format your response as:
SUBJECT: [subject line here]
EMAIL:
[email body here]
`;

    // If no OpenAI API key is configured, use mock data for development
    if (!process.env.OPENAI_API_KEY) {
      console.warn("No OpenAI API key found. Using mock data.");
      const mockEmail = `Hello Professor,

I hope you're doing well. I had a question about the homework due this week. I wanted to ask if we're allowed to use external libraries for the final part of the assignment.

Thanks!
${fullName}`;
      
      const mockSubject = "Question about homework assignment";
      
      return res.status(200).json({ 
        result: mockEmail,
        subject: mockSubject 
      });
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
    
    // Parse the response to extract subject and email body
    let subject = "";
    let emailBody = message;
    
    // Look for the subject line pattern
    const subjectMatch = message.match(/SUBJECT:\s*(.+)\nEMAIL:/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      // Extract email body after "EMAIL:" marker
      const emailMatch = message.match(/EMAIL:\s*([\s\S]+)/i);
      if (emailMatch) {
        emailBody = emailMatch[1].trim();
      }
    } else {
      // Fallback: Try to generate a subject from the topic if not found
      subject = topic.slice(0, 50) + (topic.length > 50 ? "..." : "");
    }
    
    return res.status(200).json({ 
      result: emailBody,
      subject: subject 
    });
  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: "Failed to generate email: " + err.message });
  }
}