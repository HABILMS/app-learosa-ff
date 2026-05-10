import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { fileURLToPath } from "url";

import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: os.tmpdir() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Transcription
  app.post("/api/transcribe", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }
      
      const { lang } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      console.log("Uploading file to Gemini API...");
      const uploadResult = await ai.files.upload({
        file: req.file.path,
        config: {
          mimeType: req.file.mimetype || 'audio/webm',
        }
      });
      
      console.log("File uploaded successfully. Generating transcription...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          uploadResult,
          { text: `Transcribe this audio precisely. Important: Provide ONLY the transcription text without any markdown or formatting blocks like \`\`\`. The audio language is likely ${lang || 'pt-BR'}, so return the transcription in that language. Add paragraph breaks for natural pauses or speaker changes.` }
        ]
      });
      
      console.log("Transcription complete.");
      
      // Cleanup temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp audio file:", err);
      });
      
      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Transcription error:", err);
      res.status(500).json({ error: err.message || "Failed to transcribe audio" });
    }
  });

  // API Route for NVIDIA Summarization
  app.post("/api/summarize", async (req, res) => {
    try {
      const { text, lang } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }
      
      if (!process.env.NVIDIA_API_KEY) {
        return res.status(401).json({ error: "NVIDIA_API_KEY not configured. Add it in the settings." });
      }
      
      const promptLang = lang === 'pt-BR' ? 'em português' : 'in the original language';
      
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-70b-instruct",
          messages: [
            {
              role: "system",
              content: `Você é um assistente especializado em organizar e resumir transcrições de reuniões. Por favor, responda ${promptLang}.`
            },
            {
              role: "user",
              content: `Por favor, organize e faça um resumo estruturado da seguinte transcrição, destacando os principais pontos, tópicos discutidos e itens de ação se houver:\n\n${text}`
            }
          ],
          max_tokens: 1024,
        })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`NVIDIA API Error: ${response.status} ${JSON.stringify(errData)}`);
      }
      
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content;
      
      res.json({ summary });
    } catch (err: any) {
      console.error("Summarization error:", err);
      res.status(500).json({ error: err.message || "Failed to summarize text" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
