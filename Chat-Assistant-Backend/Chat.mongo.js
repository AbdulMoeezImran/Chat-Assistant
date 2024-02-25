import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatId: {
    type: Number,
    required: true,
  },
  userMessage: {
    type: String,
    required: true,
  },
  botMessage: {
    type: String,
    required: true,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
