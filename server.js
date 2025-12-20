import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =====================
   HEALTH CHECK
===================== */
app.get("/", (req, res) => {
  res.json({ status: "Gemini Express API is running 🚀" });
});

/* =====================
   GEMINI API ROUTE
===================== */
app.post("/gemini", async (req, res) => {
  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      }
    );

    const data = await geminiResponse.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Gemini Express API running on port ${PORT}`);
});
