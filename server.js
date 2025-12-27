import express from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

app.use(cors());
app.use(express.json({ limit: "15mb" }));

// 🔎 Attach request ID for debugging
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

// ✅ Root
app.get("/", (req, res) => {
  res.json({
    message: "Gemini backend is running",
    requestId: req.requestId,
  });
});

// ✅ Health
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    requestId: req.requestId,
  });
});

// 🔮 Gemini Vision
app.post("/gemini-vision", async (req, res) => {
  const { query, mode, base64Image } = req.body;

  // 🔒 Validation
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY",
      requestId: req.requestId,
    });
  }

  if (!base64Image) {
    return res.status(400).json({
      error: "base64Image is required",
      requestId: req.requestId,
    });
  }

  const prompt =
    mode === "list"
      ? "ONLY list visible objects as bullet points."
      : "Describe the scene clearly and concisely.";

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
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
      },
      {
        timeout: 15000, // ⏱️ Prevent hanging requests
      }
    );

    res.status(200).json({
      success: true,
      data: response.data,
      requestId: req.requestId,
    });
  } catch (err) {
    // 🧠 Extract useful error info safely
    const status = err.response?.status || 500;
    const geminiError = err.response?.data || null;

    console.error("❌ Gemini Error", {
      requestId: req.requestId,
      status,
      message: err.message,
      geminiError,
    });

    res.status(status).json({
      success: false,
      error: "Gemini request failed",
      details: geminiError || err.message,
      requestId: req.requestId,
    });
  }
});

// 🧯 Global fallback (never crash silently)
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Error", {
    requestId: req.requestId,
    error: err,
  });

  res.status(500).json({
    error: "Internal server error",
    requestId: req.requestId,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
