import http from "http";
import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Server } from "socket.io";
import Chat from "./Chat.mongo.js";

let DEFAULT_CHAT_ID = 0;
dotenv.config();
const server = http.createServer(app);

// OpenAi responses in real-time
const openai = new OpenAI({
  apiKey: "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",
});

const io = new Server(server, {
  cors: true,
});

async function getLatestChatId() {
  const latestChatId = await Chat.findOne().sort("-chatId");

  if (!latestChatId) {
    return DEFAULT_CHAT_ID;
  }

  return latestChatId.chatId;
}

async function getAssistantMessage(userMessage, socket) {
  const newChatId = (await getLatestChatId()) + 1;
  let CompleteBotMessage = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: userMessage }],
    stream: true,
  });

  // Emit each chunk of the response separately to the client
  for await (const chunk of stream) {
    const botMessage = chunk.choices[0]?.delta?.content || "";
    CompleteBotMessage += chunk.choices[0]?.delta?.content || "";
    if (botMessage.trim() !== "") {
      socket.emit("receive_message", {
        chatId: newChatId,
        userMessage,
        botMessage,
      });
    }

    if (chunk.choices[0]?.finish_reason === "stop") {
      await Chat.create({
        chatId: newChatId,
        userMessage,
        botMessage: CompleteBotMessage,
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
    await getAssistantMessage(userMessage, socket);
  });
});

// MongoDB
const MONGO_URL = process.env.DB_URL;

mongoose.connection.once("open", () =>
  console.log("MongoDB connection ready!")
);

mongoose.connection.on("error", err => {
  console.error(err);
});

const startServer = async () => {
  await mongoose.connect(
    "mongodb+srv://nasa-api:!Q2w3e4r@nasacluster.cwoin1h.mongodb.net/NASA?retryWrites=true&w=majority"
  );

  server.listen(4000, () => {
    console.log("listening on port:4000");
  });
};

startServer();
