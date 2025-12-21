import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ✅ HEALTH CHECK (REQUIRED BY RENDER)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ✅ GEMINI ENDPOINT
app.post("/gemini", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔴 THIS LINE FIXES YOUR ISSUE
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
