import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/* =======================
   HEALTH CHECK
======================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =======================
   GEMINI IMAGE ANALYSIS
======================= */
app.post("/analyze", async (req, res) => {
  try {
    const { query, image, mode } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const instruction =
      mode === "list"
        ? "ONLY list visible objects in bullet points. No extra text."
        : "Describe the image clearly and concisely.";

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${instruction}\n\nUser request: ${query}` },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`Gemini backend running on port ${PORT}`);
});
