import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";

const ChatBox = ({ socket }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [getMessages, setGetMessages] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const handleMessage = (data) => {
      setChatHistory((prevChatHistory) => {
        // Check if there's an existing chat message with the same chatId
        const existingChatIndex = prevChatHistory.findIndex(
          (item) => item.chatId === data.chatId,
        );

        if (existingChatIndex !== -1) {
          // If chat message with same id exists, update its botMessage
          return prevChatHistory.map((item, index) => {
            if (index === existingChatIndex) {
              return {
                ...item,
                botMessage: item.botMessage + data.botMessage,
              };
            }
            return item;
          });
        } else {
          // If chat message with same id doesn't exist, add a new chat message
          return [
            ...prevChatHistory,
            {
              chatId: data.chatId,
              userMessage: data.userMessage,
              botMessage: data.botMessage,
            },
          ];
        }
      });

      setIsWaiting(false);
      setMessage("");
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    setGetMessages(true);
    const fetchMessages = async () => {
      const response = await fetch("http://192.168.1.105:4000/chat", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response) {
        const data = await response.json();
        setChatHistory(data);
        setGetMessages(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      return;
    }

    setIsWaiting(true);

    socket.emit("send_message", { userMessage: message });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return getMessages ? (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-[#1b1b1b]">
      <div className="h-20 w-20 animate-spin rounded-full border-4 border-solid border-white border-t-transparent shadow-md" />
    </div>
  ) : (
    <div className="flex h-screen flex-col bg-[#1b1b1b]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3">
        <img
          className="size-10"
          src={process.env.PUBLIC_URL + "/Images/chatgpt.png"}
          alt="User Avatar"
        />
        <div className="text-xl font-medium">ChatGPT 3.5 Turbo</div>
      </div>

      {/* Chat History */}
      {chatHistory.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 px-5 py-3">
          <img
            src="./Images/chatgpt.png"
            alt="gpt-logo "
            className="h-20 w-20"
          />
          <p className="text-2xl font-medium">How can I help you today?</p>
        </div>
      ) : (
        <div
          id="scroll-bar"
          ref={chatContainerRef}
          className="h-full flex-1 overflow-y-scroll px-5 py-3"
        >
          <div className="flex h-full flex-col gap-5">
            {chatHistory.map((chat, index) => (
              <div key={index} className="flex flex-col gap-5 py-2">
                <div className="flex justify-end gap-2">
                  <div className="w-fit max-w-[80%] rounded-lg bg-[#353535] p-2 text-lg text-white shadow md:max-w-[60%]">
                    {chat.userMessage}
                  </div>
                  <img
                    className="size-10 rounded-full"
                    src={process.env.PUBLIC_URL + "/Images/user-avatar.png"}
                    alt="User Avatar"
                  />
                </div>
                <div className="flex gap-2">
                  <img
                    className="size-10 rounded-full bg-black p-1.5"
                    src={process.env.PUBLIC_URL + "/Images/chatgpt.png"}
                    alt="User Avatar"
                  />
                  <div className="w-fit max-w-[80%] rounded-lg bg-[#353535] p-2 text-lg shadow md:max-w-[60%]">
                    {chat.botMessage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input field */}
      <div className="mx-5 mb-8 mt-3 flex items-center justify-center rounded-3xl border border-white px-5">
        <input
          type="text"
          className="w-full bg-transparent py-2 text-xl outline-none"
          placeholder="Message assistant..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        {isWaiting ? (
          <div className="flex gap-1">
            <div className="size-2 animate-pulse rounded-full bg-white"></div>
            <div className="size-2 animate-pulse rounded-full bg-white"></div>
            <div className="size-2 animate-pulse rounded-full bg-white"></div>
          </div>
        ) : (
          <i
            className="fas fa-paper-plane cursor-pointer text-lg"
            onClick={handleSendMessage}
          ></i>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
