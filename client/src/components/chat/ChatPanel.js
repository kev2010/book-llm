import React, { useState, useEffect, useRef } from "react";
// Components
import InputBox from "./InputBox";
import MessagesList from "./MessagesList";
// Custom Hooks
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { cn } from "../../utils/utils";
import { Alert } from "@nextui-org/alert";

export default function ChatPanel({
  messages,
  sendMessage,
  showAlert,
  setShowAlert,
}) {
  const messagesContainerRef = useRef(null);
  const horizontalPadding = "w-1/2"; // Same horizontal size for both messages list and input box

  useAutoScroll(messages, messagesContainerRef);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      // Cleanup the timer if the component unmounts or showAlert changes
      return () => clearTimeout(timer);
    }
  }, [showAlert, setShowAlert]);

  return (
    <div className="flex flex-col w-full h-screen items-center justify-between bg-customGray-900">
      {showAlert && (
        <div className="absolute w-3/4 flex items-center justify-center mt-2">
          <Alert color="secondary" title="Not available yet!" />
        </div>
      )}
      <MessagesList
        messages={messages}
        horizontalPadding={horizontalPadding}
        messagesContainerRef={messagesContainerRef}
      />
      <div className={cn("w-full mb-8", horizontalPadding)}>
        <InputBox isAIGeneratingResponse={false} sendMessage={sendMessage} />
      </div>
    </div>
  );
}
