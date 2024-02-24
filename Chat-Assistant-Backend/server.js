import http from "http";
import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(cors());

const apiKey = process.env.apiKey;
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

io.on("connection", socket => {
  console.log(`a user connected ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`a user disconnected ${socket.id}`);
  });

  socket.on("send_message", async ({ userMessage }) => {
    const botMessage = await getAssistantMessage(userMessage);
    socket.emit("receive_message", {
      userMessage,
      botMessage,
    });
  });
});

server.listen(4000, () => {
  console.log("listening on port:4000");
});
