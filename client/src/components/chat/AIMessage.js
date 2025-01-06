import React, { useRef, useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";
import { cn } from "../../utils/utils";
import { useMultiline } from "../../hooks/useMultiline";
import QuickPanel from "./QuickPanel";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// TODO: Later move to custom hook
export default function AIMessage({
  id,
  content,
  finishedResponding,
  isLastMessage,
  avatarSize,
  sendMessage,
  allowQuickPanel,
  threads,
  viewThread,
  createNewThread,
}) {
  const aiMessageRef = useRef(null);
  const isMultiline = useMultiline(aiMessageRef);
  const [selection, setSelection] = useState(null);
  const [selectionMenu, setSelectionMenu] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  // For handling selection of text and showing the quick panel
  useEffect(() => {
    function handleSelectionChange() {
      const sel = window.getSelection();
      const text = sel.toString().trim();

      // If there's no range or it's collapsed, hide the menu
      if (!sel.rangeCount || sel.isCollapsed || !text) {
        setSelectionMenu(false);
        return;
      }

      // Check if selection is within this component
      const range = sel.getRangeAt(0);
      if (!aiMessageRef.current?.contains(range.commonAncestorContainer)) {
        setSelectionMenu(false);
        return;
      }

      setSelection({ text, range: range.cloneRange() });
    }

    function handleMouseUp(e) {
      // Only process if the mouseup happened inside this component
      if (!aiMessageRef.current?.contains(e.target)) {
        setSelectionMenu(false);
        return;
      }

      const sel = window.getSelection();
      const text = sel.toString().trim();

      if (text) {
        setSelectionMenu(true);
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Update position of QuickPanel when element size/position changes
  useEffect(() => {
    if (!aiMessageRef.current || !selectionMenu) return;

    const updatePosition = () => {
      const rect = aiMessageRef.current.getBoundingClientRect();
      setPosition({
        left: rect.right + 16,
        top: rect.top,
      });
    };

    // Initial position
    updatePosition();

    // Create resize observer
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(aiMessageRef.current);

    // Listen for events
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [selectionMenu]);

  return (
    <div className={cn("w-fit max-w-[82%] relative group overflow-visible")}>
      <div className="flex flex-row relative overflow-visible items-end">
        <Image
          src="/assets/chung.svg"
          alt="Chung Ju-Yung"
          className={cn(
            avatarSize === "small" ? "w-8 h-8 mr-3" : "w-12 h-12 mr-4"
          )}
          width={128}
          height={128}
        />
        <div className="flex flex-col">
          <p className="text-base text-customGray-50 font-bold pl-4 pb-2">
            Chung Ju-Yung
          </p>
          <div
            className={cn(
              "flex flex-row items-center justify-center border border-customGray-300 bg-customGray-700 px-4 py-3",
              isMultiline ? "rounded-lg" : "rounded-full"
            )}
            ref={aiMessageRef}
          >
            <div className="text-base text-white font-normal max-w-none">
              <Markdown
                components={{
                  // Override paragraph to render inline with the cursor
                  p: ({ children }) => (
                    <span className="inline">
                      {children}
                      {!finishedResponding && isLastMessage && (
                        <span className="inline-block w-4 h-4 ml-1 bg-white rounded-full align-middle" />
                      )}
                    </span>
                  ),
                  // Ensure other block elements don't break the inline flow
                  pre: ({ children }) => (
                    <span className="inline">{children}</span>
                  ),
                  code: ({ children }) => (
                    <code className="inline">{children}</code>
                  ),
                }}
              >
                {content}
              </Markdown>
            </div>
          </div>
        </div>
      </div>

      {allowQuickPanel && threads.some((thread) => thread.id === id) && (
        <div
          className="flex flex-row items-center justify-end mt-2 hover:cursor-pointer hover:underline hover:text-primaryLight"
          onClick={() => viewThread(id)}
        >
          <Image
            src="/assets/thread_active.svg"
            alt="Thread"
            className="w-3 h-3 mr-1"
            width={16}
            height={16}
          />
          <p className="text-primaryLight text-xs">View Thread</p>
        </div>
      )}

      {/* Selection Menu - Fixed on the right side of the message (NOTE: We use a portal to prevent it from being clipped by the parent div)*/}
      {createPortal(
        <AnimatePresence>
          {allowQuickPanel &&
            (finishedResponding || !isLastMessage) &&
            selectionMenu &&
            selection && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed z-50"
                style={{ left: position.left, top: position.top }}
              >
                <QuickPanel
                  messageID={id}
                  selection={selection}
                  sendMessage={sendMessage}
                  allowCreateThread={
                    !threads.some((thread) => thread.id === id)
                  }
                  createNewThread={createNewThread}
                />
              </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
