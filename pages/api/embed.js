// pages/api/embed.js
export default async function handler(req, res) {
  const { text } = req.body;

  try {
    const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-ada-002"
      })
    });

    const result = await embeddingRes.json();
    const embedding = result.data?.[0]?.embedding;

    if (!embedding) throw new Error("No embedding returned");

    res.status(200).json({ embedding });
  } catch (err) {
    console.error("Embedding error:", err);
    res.status(500).json({ error: "Failed to generate embedding" });
  }
}
