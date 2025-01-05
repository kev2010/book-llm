import React, { useState, useEffect, useRef } from "react";
// Components
import InputBox from "./InputBox";
import MessagesList from "./MessagesList";
import Suggestions from "../Suggestions";
// Custom Hooks
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { cn } from "../../utils/utils";
import { Alert } from "@nextui-org/alert";

export default function ChatPanel({
  messages,
  sendMessage,
  showAlert,
  setShowAlert,
  finishedResponding,
}) {
  const messagesContainerRef = useRef(null);
  const horizontalPadding = "w-[42rem]"; // Same horizontal size for both messages list and input box

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
        finishedResponding={finishedResponding}
      />
      <div className={cn("w-full mb-8", horizontalPadding)}>
        {
          // Only show suggestions when it's just the intro message
          messages.length === 1 && (
            <div className="mb-4">
              <Suggestions sendMessage={sendMessage} />
            </div>
          )
        }
        <InputBox
          isAIGeneratingResponse={!finishedResponding}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
