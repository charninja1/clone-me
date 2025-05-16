import { db } from "../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";

export default async function handler(req, res) {
  const { topic, userId, toneId, examples = "[None yet]" } = req.body;

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
Write an email in the name of ${fullName}. 
${toneInstructions}
Include context:
"${topic}"

Here are some previously approved emails from this tone:
${examples}

Generate a new email in this style.
End with a friendly signoff like "Thanks!" or "Best," and sign as ${fullName}.
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