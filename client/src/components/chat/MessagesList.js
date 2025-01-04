import React, { useRef } from "react";
import { cn } from "../../utils/utils";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { useMultiline } from "../../hooks/useMultiline";
import Image from "next/image";

function UserMessage({ content }) {
  const messagesContainerRef = useRef(null);
  const isMultiline = useMultiline(messagesContainerRef);

  return (
    <div className="flex flex-col justify-end items-end ml-auto max-w-[82%]">
      <div
        className={cn(
          "bg-primary px-4 py-3",
          isMultiline ? "rounded-lg" : "rounded-full"
        )}
        ref={messagesContainerRef}
      >
        <p className="text-base text-white font-normal">{content}</p>
      </div>
    </div>
  );
}

function AIMessage({ content }) {
  const messagesContainerRef = useRef(null);
  const isMultiline = useMultiline(messagesContainerRef);

  return (
    <div className="flex flex-row items-end max-w-[82%]">
      <Image
        src="/assets/chung.svg"
        alt="Chung Ju-Yung"
        className="w-12 h-12 mr-4"
        width={128}
        height={128}
      />
      <div className="flex flex-col">
        <p className="text-base text-customGray-50 font-bold pl-4 pb-2">
          Chung Ju-Yung
        </p>
        <div
          className={cn(
            "flex flex-col border border-customGray-300 bg-customGray-700 px-4 py-3",
            isMultiline ? "rounded-lg" : "rounded-full"
          )}
          ref={messagesContainerRef}
        >
          <p className="text-base text-white font-normal">{content}</p>
        </div>
      </div>
    </div>
  );
}

export default function MessagesList({
  messages,
  horizontalPadding,
  messagesContainerRef,
}) {
  return (
    <ScrollShadow
      className={cn(
        "w-full overflow-y-auto mt-6 pb-6 space-y-4",
        horizontalPadding
      )}
      ref={messagesContainerRef}
    >
      {messages &&
        messages.map((message, index) => {
          if (message.role === "user") {
            return <UserMessage key={index} content={message.content} />;
          } else {
            return <AIMessage key={index} content={message.content} />;
          }
        })}
    </ScrollShadow>
  );
}
