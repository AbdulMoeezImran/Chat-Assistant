import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const apiKey = process.env.apiKey;
console.log(apiKey);
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey,
});

async function getAssistantMessage(message) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: message }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}

app.post("/", async (req, res) => {
  const { message } = req.body;
  const botMessage = await getAssistantMessage(message);
  console.log({ userMessage: message, botMessage });
  res.json({ userMessage: message, botMessage });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
