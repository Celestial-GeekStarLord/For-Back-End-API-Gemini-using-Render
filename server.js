import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/analyze", async (req, res) => {
  try {
    const { base64Image, query, mode } = req.body;

    if (!base64Image || !query) {
      return res.status(400).json({ error: "Missing data" });
    }

    const prompt =
      mode === "list"
        ? "List visible objects in bullet points."
        : "Describe the image clearly for a blind person.";

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${prompt}\nUser query: ${query}` },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(3000, () => console.log("Gemini backend running"));
