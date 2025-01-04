import React, { useState, useEffect, useRef } from "react";
// Components
import InputBox from "./InputBox";
import MessagesList from "./MessagesList";
// Custom Hooks
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { cn } from "../../utils/utils";

export default function ChatPanel({ messages }) {
  const messagesContainerRef = useRef(null);
  const horizontalPadding = "w-1/2"; // Same horizontal size for both messages list and input box

  useAutoScroll(messages, messagesContainerRef);

  return (
    <div className="flex flex-col w-full h-screen items-center justify-between bg-customGray-900">
      <MessagesList
        messages={messages}
        horizontalPadding={horizontalPadding}
        messagesContainerRef={messagesContainerRef}
      />
      <div className={cn("w-full mb-8", horizontalPadding)}>
        <InputBox isAIGeneratingResponse={false} sendMessage={() => {}} />
      </div>
    </div>
  );
}
