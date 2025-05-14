import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");

  async function handleGenerate() {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    console.log("Response from API:", data); // <--- ADD THIS

    setResponse(data.result || "No result returned.");
  } catch (err) {
    console.error("Frontend error:", err);
    setResponse("An error occurred while generating the email.");
  }
}


  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Professor Email Generator</h1>
      <textarea
        rows={4}
        style={{ width: "100%", marginBottom: "1rem" }}
        placeholder="Describe what you want to say (e.g. 'ask for extension on homework')"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button onClick={handleGenerate}>Generate Email</button>
      {response && (
        <div style={{ marginTop: "2rem" }}>
        <h3>Generated Email:</h3>
        <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={8}
        style={{ width: "100%" }}
        />
  </div>
)}
    </div>
  );
}
