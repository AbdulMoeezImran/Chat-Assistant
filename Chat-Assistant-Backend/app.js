import express from "express";
import cors from "cors";
import Chat from "./Chat.mongo.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/chat", async (req, res) => {
  const getAllChatMessages = await Chat.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
  res.send(getAllChatMessages);
});

export default app;
