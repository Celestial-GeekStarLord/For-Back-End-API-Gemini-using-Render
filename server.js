import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

// ✅ Root
app.get("/", (req, res) => {
  res.send("Gemini backend is running");
});

// ✅ Health
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 🔮 Gemini Vision
app.post("/gemini-vision", async (req, res) => {
  try {
    const { query, mode, base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "Image missing" });
    }

    const prompt =
      mode === "list"
        ? "ONLY list visible objects as bullet points."
        : "Describe the scene clearly and concisely.";

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: query || prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
