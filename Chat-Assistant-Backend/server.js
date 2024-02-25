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

let chatId = 0;

app.use(express.json());
app.use(cors());

const apiKey = process.env.apiKey;
const openai = new OpenAI({
  apiKey,
});

async function getAssistantMessage(userMessage, socket) {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: userMessage }],
    stream: true,
  });

  // Emit each chunk of the response separately to the client
  for await (const chunk of stream) {
    const botMessage = chunk.choices[0]?.delta?.content || "";
    if (botMessage.trim() !== "") {
      socket.emit("receive_message", {
        chatId,
        userMessage,
        botMessage,
      });
    }
  }
}

io.on("connection", socket => {
  console.log(`a user connected ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`a user disconnected ${socket.id}`);
  });

  socket.on("send_message", async ({ userMessage }) => {
    chatId++;
    await getAssistantMessage(userMessage, socket);
  });
});

server.listen(4000, () => {
  console.log("listening on port:4000");
});
