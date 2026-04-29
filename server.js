import express from "express";
import Replicate from "replicate";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// File upload setup
// --------------------
const upload = multer({ dest: "uploads/" });

// --------------------
// Health check
// --------------------
app.get("/", (req, res) => {
  res.send("XTTS Voice Cloning API Running");
});

// --------------------
// Replicate client
// --------------------
const createReplicate = () => {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  return new Replicate({ auth: token });
};

// --------------------
// Voice cloning endpoint
// --------------------
app.post("/clone", upload.single("voice"), async (req, res) => {
  try {
    const replicate = createReplicate();

    if (!replicate) {
      return res.status(500).json({ error: "Missing API token" });
    }

    const { text } = req.body;
    const file = req.file;

    if (!text || !file) {
      return res.status(400).json({
        error: "Text and voice recording are required",
      });
    }

    // Convert local file path to public URL (IMPORTANT)
    // You MUST replace this with S3 / Firebase in production
    const speaker_wav = `${req.protocol}://${req.get("host")}/${file.path}`;

    const output = await replicate.run("coqui/xtts-v2", {
      input: {
        text: text.trim(),
        language: "en",
        speaker_wav,
      },
    });

    const audio = Array.isArray(output) ? output[0] : output;

    res.json({
      success: true,
      audio,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "Cloning failed",
    });
  }
});

// --------------------
// Serve uploaded files
// --------------------
app.use("/uploads", express.static("uploads"));

// --------------------
// Start server (Base44 / Railway safe)
// --------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
