"use client"; // NOTE: I know this defeats the purpose of app router, but using client components for now (I'm used to pages router, will optimize with server components later)

import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/chat/ChatPanel";
import { fetchAIResponse } from "./api";

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
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const bufferRef = useRef("");
  const intervalIdRef = useRef(null);
  const finishedResponding =
    bufferRef.current.length === 0 && !isGeneratingResponse;

  const getAIResponse = async () => {
    if (isGeneratingResponse) {
      return;
    }

    setIsGeneratingResponse(true);

    // Parse the stream and append the message to the state
    const reader = await fetchAIResponse(messages);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setIsGeneratingResponse(false);
        break;
      }

      bufferRef.current += new TextDecoder().decode(value);
    }
  };

  const sendMessage = (message) => {
    setMessages([...messages, { role: "user", content: message }]);
  };

  // Generate an AI response when the user sends a message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      getAIResponse();
    }
  }, [messages]);

  // To make streaming smoother, we use a buffer to store the AI response and append it to the state (otherwise it's way too fast)
  useEffect(() => {
    if (isGeneratingResponse) {
      setCurrentMessage("");
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current); // Clear any existing interval
      }

      intervalIdRef.current = setInterval(() => {
        if (finishedResponding) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }

        if (bufferRef.current.length > 0) {
          const nextChar = bufferRef.current.charAt(0);
          bufferRef.current = bufferRef.current.slice(1); // Remove the first character

          setCurrentMessage((prevMessage) => prevMessage + nextChar);
        }
      }, 20);
    }
  }, [isGeneratingResponse]);

  // We have a second buffer to store the current message and append it to the state
  // I think this is necessary because using "setMessages" in a setInterval is a stale closure, so it always has an old value and thus overwrites itself
  useEffect(() => {
    if (currentMessage.length > 0) {
      const toAdd = currentMessage;
      setCurrentMessage("");

      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const isLastMessageFromUser = lastMessage.role === "user";

        return isLastMessageFromUser
          ? [...prevMessages, { role: "assistant", content: toAdd }]
          : [
              ...prevMessages.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + toAdd,
              },
            ];
      });
    }
  }, [currentMessage]);

  useEffect(() => {
    // Cleanup interval when component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full min-h-screen w-full flex flex-row bg-customGray-800">
      <div className="w-72 hidden lg:block">
        <Sidebar
          books={books}
          currentChat={currentChat}
          setShowAlert={setShowAlert}
        />
      </div>
      <div className="relative w-full hidden lg:flex lg:flex-row bg-customGray-900 border-l border-customGray-400">
        <ChatPanel
          messages={messages}
          sendMessage={sendMessage}
          showAlert={showAlert}
          setShowAlert={setShowAlert}
          finishedResponding={finishedResponding}
        />
      </div>
      <div className="lg:hidden w-full h-screen flex flex-col justify-center items-center text-lg text-customGray-50 bg-customGray-800 p-4">
        Please view on laptop! This isn&apos;t made to be responsive
      </div>
    </div>
  );
}
