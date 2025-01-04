import React from "react";
import { cn } from "../../utils/utils";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

function UserMessage({ text }) {
  return (
    <div className="flex flex-col justify-end items-end ml-auto max-w-[82%]">
      <div className={cn("bg-primary px-4 py-3", "rounded-lg")}>
        <p className="text-base text-customGray-50 font-light">{text}</p>
      </div>
    </div>
  );
}

function AIMessage({ text }) {
  return (
    <div className="flex flex-row items-start max-w-[82%]">
      <div
        className={cn(
          "flex flex-col border border-customGray-300 bg-customGray-700 px-4 py-3",
          "rounded-lg"
        )}
      >
        <p className="text-base text-customGray-50 font-light">{text}</p>
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
      className={cn("w-full overflow-y-auto mt-6 pb-6", horizontalPadding)}
      ref={messagesContainerRef}
    >
      {messages &&
        messages.map((message, index) => {
          if (message.role === "user") {
            return <UserMessage key={index} text={message.text} />;
          } else {
            return <AIMessage key={index} text={message.text} />;
          }
        })}
    </ScrollShadow>
  );
}
