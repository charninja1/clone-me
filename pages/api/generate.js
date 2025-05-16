export default async function handler(req, res) {
  const { topic } = req.body;

  const prompt = `
Write an email to a college professor in the tone of Charlie Peroulas. 
Make it polite, casual, direct, and not too formal. Include context:
"${topic}"
End with a friendly signoff like "Thanks!" or "Best," and sign as Charlie Peroulas.
`;

  try {
    // If no OpenAI API key is configured, use mock data for development
    if (!process.env.OPENAI_API_KEY) {
      console.warn("No OpenAI API key found. Using mock data.");
      const mockEmail = `
      Hello Professor,

      I hope you're doing well. I had a question about the homework due this week. I wanted to ask if we're allowed to use external libraries for the final part of the assignment.

      Thanks!
      Charlie Peroulas
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