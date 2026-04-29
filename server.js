import express from "express";
import Replicate from "replicate";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --------------------
// Health check route
// --------------------
app.get("/", (req, res) => {
  res.send("XTTS API is running");
});

// --------------------
// Create Replicate client safely
// --------------------
const createReplicate = () => {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("❌ Missing REPLICATE_API_TOKEN");
    return null;
  }

  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
};

// --------------------
// TTS endpoint
// --------------------
app.post("/tts", async (req, res) => {
  try {
    const replicate = createReplicate();

    if (!replicate) {
      return res.status(500).json({
        error: "Server missing API token"
      });
    }

    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    const output = await replicate.run("coqui/xtts-v2", {
      input: {
        text,
        speaker: "female_en_1",
        language: "en"
      }
    });

    res.json({ audio: output });

  } catch (err) {
    console.error("TTS ERROR:", err);
    res.status(500).json({
      error: err.message || "TTS failed"
    });
  }
});

// --------------------
// Railway-safe PORT handling
// --------------------
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
