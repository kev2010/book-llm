import { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/utils";
import { ArrowUpIcon } from "@radix-ui/react-icons";
import { useMultiline } from "../../hooks/useMultiline";
import TextareaAutosize from "react-textarea-autosize";

export default function InputBox({
  isAIGeneratingResponse,
  sendMessage,
  placeholder = "Ask anything...",
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const isMultiline = useMultiline(textareaRef);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (text !== "") {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    sendMessage(text);
    setText("");
  };

  return (
    // Use inline-flex since default display: block is adding ghost padding on the bottom
    <div className="relative inline-flex w-full">
      <TextareaAutosize
        ref={textareaRef}
        type="text"
        placeholder={placeholder}
        className={cn(
          "bg-customGray-400",
          "w-full",
          "pl-5",
          "pr-28",
          "text-customGray-50",
          "resize-none",
          "ring-1",
          "ring-inset",
          "ring-customGray-200",
          "focus:ring-1",
          "focus:ring-customGray-100",
          "focus:outline-none",
          "min-h-12",
          "pt-3 pb-3",
          "overflow-y-auto",
          isMultiline ? "rounded-lg" : "rounded-full"
        )}
        value={text}
        maxRows={8}
        minRows={1}
        maxLength={2500}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div
        className={cn(
          "absolute right-2",
          isMultiline ? "top-3" : "top-1/2 -translate-y-1/2"
        )}
      >
        <button
          className={cn(
            "rounded-full px-2 py-2 font-regular text-white hover:bg-blackish",
            "disabled:text-customGray-200",
            "bg-primary disabled:bg-customGray-500"
          )}
          type="submit"
          disabled={text === ""}
          onClick={handleSubmit}
        >
          <ArrowUpIcon width="20" height="20" className={"p-0"} />
        </button>
      </div>
    </div>
  );
}
