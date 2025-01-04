"use client"; // NOTE: I know this defeats the purpose of app router, but using client components for now (I'm used to pages router, will optimize with server components later)

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/chat/ChatPanel";
export default function Home() {
  const [books, setBooks] = useState([
    {
      id: 0,
      name: "Born Of This Land",
      chats: [{ id: 0, date: "Today", title: "New Chat" }],
    },
  ]);
  const [currentChat, setCurrentChat] = useState({
    bookID: 0,
    chatID: 0,
    // TODO: Will need something like updateTime for cache busting when we have chats in S3 bucket
    // updateTime: "",
  });
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, I’m Chung Ju-Yung! My family and I grew up so poor that we ate tree bark to survive. I ran away from home four times to chase my dreams, and built Hyundai .... [todo]",
    },
  ]);
  const [showAlert, setShowAlert] = useState(false);

  const sendMessage = (message) => {
    setMessages([...messages, { role: "user", content: message }]);
  };

  return (
    <div>
      <div className="h-full min-h-screen w-full flex flex-row bg-customGray-800">
        <div className="w-[16%]">
          <Sidebar
            books={books}
            currentChat={currentChat}
            setShowAlert={setShowAlert}
          />
        </div>
        <div className="relative w-[84%] bg-customGray-900 flex flex-row border-l border-customGray-400">
          <ChatPanel
            messages={messages}
            sendMessage={sendMessage}
            showAlert={showAlert}
            setShowAlert={setShowAlert}
          />
        </div>
      </div>
    </div>
  );
}
