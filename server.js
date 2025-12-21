import express from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ ROOT health check (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Gemini backend is running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔮 Gemini Vision endpoint
app.post("/gemini-vision", upload.single("image"), async (req, res) => {
  try {
    const { query, mode, base64Image } = req.body;

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
