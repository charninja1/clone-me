export default async function handler(req, res) {
  const { topic } = req.body;

  const prompt = `
Write an email to a college professor in the tone of Charlie Peroulas. 
Make it polite, casual, direct, and not too formal. Include context:
"${topic}"
End with a friendly signoff like "Thanks!" or "Best," and sign as Charlie Peroulas.
`;

  try {
    /*const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    */
    const mockEmail = `
    Hello Professor,

    I hope you're doing well. I had a question about the homework due this week. I wanted to ask if we’re allowed to use external libraries for the final part of the assignment.

    Thanks!
    Charlie Peroulas
    `;

res.status(200).json({ result: mockEmail });


    const data = await completion.json();
    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));  // FULL RESPONSE LOG

    const message = data.choices?.[0]?.message?.content || "No message found";
    res.status(200).json({ result: message });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

