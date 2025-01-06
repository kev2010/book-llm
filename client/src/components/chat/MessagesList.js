import React, { useRef } from "react";
import { cn } from "../../utils/utils";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { useMultiline } from "../../hooks/useMultiline";

import AIMessage from "./AIMessage";

function UserMessage({ content }) {
  const userMessageRef = useRef(null);
  const isMultiline = useMultiline(userMessageRef);

  return (
    <div className="flex flex-col justify-end items-end ml-auto max-w-[82%]">
      <div
        className={cn(
          "bg-primary px-4 py-3",
          isMultiline ? "rounded-lg" : "rounded-full"
        )}
        ref={userMessageRef}
      >
        <p className="text-base text-white font-normal">{content}</p>
      </div>
    </div>
  );
}

export default function MessagesList({
  messages,
  horizontalPadding,
  messagesContainerRef,
  finishedResponding,
  sendMessage,
  avatarSize,
  allowQuickPanel,
  threads,
  viewThread,
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
            return (
              <AIMessage
                key={index}
                id={index}
                content={message.content}
                finishedResponding={finishedResponding}
                isLastMessage={index === messages.length - 1}
                sendMessage={sendMessage}
                avatarSize={avatarSize}
                allowQuickPanel={allowQuickPanel}
                threads={threads}
                viewThread={viewThread}
              />
            );
          }
        })}
    </ScrollShadow>
  );
}
