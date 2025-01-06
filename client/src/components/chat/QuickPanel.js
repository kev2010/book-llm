import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function QuickPanel({
  selection,
  sendMessage,
  allowCreateThread,
}) {
  // Handle menu actions
  const handleMenuAction = (action) => {
    if (!selection) return;

    switch (action) {
      case "thread":
        console.log("Opening thread for:", selection.text);
        // Your thread opening logic here
        break;
      case "detail":
        sendMessage(
          `Tell me more about: "${selection.text}". I'd like more details. Make it concise and give me interesting facts or things I wouldn't already know about!`
        );
        break;
      case "simplify":
        sendMessage(
          `I'm interested in: "${selection.text}". Can you simplify this for me? Keep in mind my background and explain things step by step!`
        );
        break;
    }
  };

  return (
    <div className="bg-customGray-800 rounded-lg shadow-lg border border-customGray-600 w-full">
      <div className="flex flex-col py-2">
        {allowCreateThread && (
          <>
            <button
              onClick={() => handleMenuAction("thread")}
              className="flex flex-row items-center space-x-2 mx-1 px-3 rounded-md py-2 hover:bg-customGray-600 text-white text-sm"
            >
              <Image
                src="/assets/thread.svg"
                alt="Thread"
                className="w-4 h-4"
                width={64}
                height={64}
              />
              <span>Create Thread</span>
            </button>
            <div className="border-b border-customGray-600 mx-2 my-1"></div>
          </>
        )}
        <button
          onClick={() => handleMenuAction("detail")}
          className="flex flex-row items-center space-x-2 mx-1 px-3 rounded-md py-2 hover:bg-customGray-600 text-white text-sm"
        >
          <Image
            src="/assets/zoom_in.svg"
            alt="Zoom In"
            className="w-4 h-4"
            width={64}
            height={64}
          />
          <span>More Detail</span>
        </button>
        <button
          onClick={() => handleMenuAction("simplify")}
          className="flex flex-row items-center space-x-2 mx-1 px-3 rounded-md py-2 hover:bg-customGray-600 text-white text-sm"
        >
          <Image
            src="/assets/zoom_out.svg"
            alt="Zoom Out"
            className="w-4 h-4"
            width={64}
            height={64}
          />
          <span>Simplify</span>
        </button>
      </div>
    </div>
  );
}
