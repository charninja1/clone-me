// pages/api/revise.js
import { db } from "../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";

export default async function handler(req, res) {
  const { originalEmail, feedback, userId, toneId } = req.body;

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
    
    // Get tone information if provided
    let toneInstructions = "Make it polite, casual, direct, and not too formal.";
    
    if (toneId) {
      const toneDoc = await getDoc(doc(db, "voices", toneId));
      if (toneDoc.exists()) {
        const toneData = toneDoc.data();
        toneInstructions = toneData.instructions || toneInstructions;
      }
    }

    const prompt = `
Revise the following email to incorporate the user's feedback. 
The email should be in the name of ${fullName}.
${toneInstructions}

ORIGINAL EMAIL:
"""
${originalEmail}
"""

FEEDBACK:
"""
${feedback}
"""

Please provide a revised version that keeps the same basic structure but incorporates the feedback.
End with a friendly signoff and sign as ${fullName}.
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
