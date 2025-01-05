import React, { useState, useEffect, useRef } from "react";
// Components
import InputBox from "./InputBox";
import MessagesList from "./MessagesList";
import Suggestions from "../Suggestions";
// Custom Hooks
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { cn } from "../../utils/utils";
import { Alert } from "@nextui-org/alert";
import { motion, AnimatePresence } from "framer-motion";

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
        <AnimatePresence>
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <Suggestions sendMessage={sendMessage} />
            </motion.div>
          )}
        </AnimatePresence>
        <InputBox
          isAIGeneratingResponse={!finishedResponding}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
