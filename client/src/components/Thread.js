/*
IMPORTANT NOTE:

Most of the functions + useEffects are duplicated from page.js (the chat functionality) -> NEEDS TO BE REFACTORED INTO A CUSTOM HOOK (if there's time)!
*/
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "../utils/utils";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import MessagesList from "./chat/MessagesList";
import InputBox from "./chat/InputBox";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { fetchAIResponse } from "../app/api";

export default function Thread({
  threads,
  currentThread,
  viewThread,
  updateThread,
  prefillThreadText,
}) {
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const horizontalPadding = "px-6";

  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const bufferRef = useRef("");
  const intervalIdRef = useRef(null);
  const finishedResponding =
    bufferRef.current.length === 0 && !isGeneratingResponse;
  useAutoScroll(messages, messagesContainerRef);

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

  useEffect(() => {
    const threadMessages = threads.find(
      (thread) => thread.id === currentThread
    ).messages;
    setMessages(threadMessages);
  }, [currentThread]);

  useEffect(() => {
    updateThread(currentThread, messages);
  }, [messages]);

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
      }, 25);
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
    <div className="flex flex-col w-full h-screen items-center justify-between bg-customGray-800">
      <div className="flex flex-col h-full w-full overflow-hidden">
        <div
          className={cn("flex flex-row items-center w-full", horizontalPadding)}
        >
          <ArrowLeftIcon
            className="w-5 h-5 text-white mt-4 hover:cursor-pointer hover:text-primaryLight"
            onClick={() => viewThread(-1)}
          />
          <p
            className={cn(
              "text-base font-semibold text-customGray-50 mt-4 ml-4"
            )}
          >
            Thread
          </p>
        </div>
        <div className={cn("w-full h-px bg-customGray-300 mt-4")} />
        <div className="flex flex-grow overflow-auto">
          <MessagesList
            messages={messages}
            horizontalPadding={horizontalPadding}
            messagesContainerRef={messagesContainerRef}
            finishedResponding={finishedResponding}
            sendMessage={sendMessage}
            avatarSize="small"
            allowQuickPanel={false}
            threads={[]}
            viewThread={() => {}}
            createNewThread={() => {}}
          />
        </div>
      </div>
      <div className={cn("w-full mb-8 flex flex-col", horizontalPadding)}>
        <div className="relative">
          <InputBox
            prefillThreadText={prefillThreadText}
            isAIGeneratingResponse={!finishedResponding}
            sendMessage={sendMessage}
            autoFocus={true}
          />
        </div>
      </div>
    </div>
  );
}
