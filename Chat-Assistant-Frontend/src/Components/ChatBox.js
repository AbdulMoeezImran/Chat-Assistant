import React, { useState } from "react";

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      return;
    }

    setMessage("");
    setIsWaiting(true);

    try {
      const response = await fetch("http://localhost:4000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });
      if (response) {
        const data = await response.json();
        console.log(data);
        chatHistory.push(data);
        setIsWaiting(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-scroll bg-gray-200">
        <div className="flex flex-col gap-5 px-4 py-2">
          <div className="mb-2 flex items-center">
            <img
              className="mr-2 size-10 bg-black p-1.5"
              src={process.env.PUBLIC_URL + "/Images/chatgpt.png"}
              alt="User Avatar"
            />
            <div className="text-xl font-medium">ChatGPT 3.5 Turbo</div>
          </div>
          {chatHistory.map((chat, index) => (
            <div key={index} className="flex flex-col gap-5 py-2">
              <div className="flex justify-end gap-2">
                <div className="w-fit max-w-[80%] rounded-lg bg-blue-500 p-2 text-lg text-white shadow md:max-w-[60%]">
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
                <div className="w-fit max-w-[80%] rounded-lg bg-white p-2 text-lg shadow md:max-w-[60%]">
                  {chat.botMessage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-100 px-4 py-2">
        <div className="flex items-center">
          <div className="flex w-full items-center justify-center rounded-3xl bg-white px-5 py-2">
            <input
              type="text"
              className="w-full text-xl text-black outline-none"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            {isWaiting ? (
              <div className="flex gap-1">
                <div className="size-2 animate-pulse rounded-full bg-black"></div>
                <div className="size-2 animate-pulse rounded-full bg-black"></div>
                <div className="size-2 animate-pulse rounded-full bg-black"></div>
              </div>
            ) : (
              <i
                className="fas fa-paper-plane cursor-pointer text-lg text-black"
                onClick={handleSendMessage}
              ></i>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;