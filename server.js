import express from "express";
import Replicate from "replicate";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Health check route
app.get("/", (req, res) => {
  res.send("XTTS API is running");
});

// TTS endpoint
app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const output = await replicate.run("coqui/xtts-v2", {
      input: {
        text: text,
        speaker: "female_en_1",
        language: "en"
      }
    });

    res.json({ audio: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// IMPORTANT: Railway needs process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
