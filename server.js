import express from "express";
import Replicate from "replicate";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.get("/", (req, res) => {
  res.send("XTTS API is running");
});

app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    const output = await replicate.run("coqui/xtts-v2", {
      input: {
        text: text,
        speaker: "female_en_1",
        language: "en"
      }
    });

    res.json({ audio: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
