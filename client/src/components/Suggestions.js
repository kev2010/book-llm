import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Suggestions({ sendMessage }) {
  const [suggestions, setSuggestions] = useState([
    "Tell me more about yourself!",
    "Can you share with me your most interesting story?",
    "What are your principles?",
  ]);

  return (
    <div className="bg-customGray-700 text-customGray-50 flex flex-col p-4 rounded-lg border border-customGray-300 drop-shadow-xl">
      <div className="flex flex-row items-center mb-6">
        <p className="flex flex-row items-center text-sm">
          Ask anything! Personality and answers are based on his autobiography:
          <span className="flex flex-row items-center ml-1 hover:cursor-pointer hover:underline hover:text-primaryLight">
            <a
              href="https://oceanofpdf.com/authors/chung-ju-yung/pdf-born-of-this-land-my-life-story-download/"
              target="_blank"
              className="text-primaryLight font-bold"
            >
              Born Of This Land
            </a>
            <Image
              src="/assets/link.svg"
              alt="Link"
              className="w-2 h-2 ml-1"
              width={16}
              height={16}
            />
          </span>
        </p>
      </div>
      <div className="flex flex-col space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="rounded-full max-w-max bg-customGray-400 px-4 py-2 cursor-pointer hover:bg-customGray-300"
            onClick={() => sendMessage(suggestion)}
          >
            <p className="text-sm">{suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
