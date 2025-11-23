import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY não definida no .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function montarPrompt(systemPrompt, history = [], userMsg) {
  let txt = `${systemPrompt}\n\n`;
  for (const msg of history) {
    if (msg.role === "user") txt += `Usuário: ${msg.content}\n`;
    if (msg.role === "assistant") txt += `Borges IA: ${msg.content}\n`;
  }
  txt += `Usuário: ${userMsg}\nBorges IA:`;
  return txt;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem inválida." });
    }

    const systemPrompt = `
Você é o Borges IA, um assistente em português do Brasil.
Responda de forma clara, direta e organizada.
Ajude com:
- programação (JavaScript, Node, HTML, CSS)
- Roblox
- dúvidas gerais de tecnologia e estudos
    `.trim();

    const prompt = montarPrompt(systemPrompt, history, message);
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Erro em /api/chat:", err);
    res.status(500).json({ error: "Erro ao conversar com o Gemini." });
  }
});

app.listen(port, () => {
  console.log(`🔥 Borges IA backend rodando em http://localhost:${port}`);
});
