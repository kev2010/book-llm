import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "../utils/utils";
import { CaretDownIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function Sidebar({ books, currentChat }) {
  const [expandedBooks, setExpandedBooks] = useState({});
  const initialLoad = useRef(true);

  // Function to toggle book section expansion
  const toggleBookSectionExpansion = (bookId) => {
    setExpandedBooks((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  // Initialize expandedBooks with all book sections expanded
  useEffect(() => {
    if (initialLoad.current && books.length > 0) {
      const result = {};
      books.forEach((book) => (result[book.id] = true));
      setExpandedBooks(result);
      initialLoad.current = false; // Set to false after initial setup
    }
  }, [books]);

  return (
    <div className="bg-customGray-800 text-white h-screen overflow-y-auto p-6 w-full">
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-row items-center">
          <h1 className="text-base font-semibold text-customGray-50">
            BookLLM
          </h1>
        </div>
      </div>
      <div className="bg-customGray-800 border border-customGray-400 px-1 py-1 rounded-full w-full flex flex-row items-center justify-between mb-8">
        <div className="flex flex-row items-center">
          <MagnifyingGlassIcon className="h-4 w-4 ml-1 mr-2 text-customGray-200" />
          <span className="text-customGray-200 text-sm">Search...</span>
        </div>
        <div className="bg-customGray-500 rounded-full px-3 py-1">
          <p className="text-customGray-200 text-sm">⌘K</p>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between py-1">
        <span className="text-customGray-50 font-medium text-xs">Books</span>
      </div>
      {books.map((book, idx) => (
        <div key={idx} className="mb-6">
          <div
            className={cn(
              "flex flex-row mb-2 items-center justify-between cursor-pointer",
              "group hover:bg-customGray-600 -mx-3 px-3 py-2 rounded-lg"
            )}
            onClick={() => toggleBookSectionExpansion(book.id)}
          >
            <div className="flex flex-row items-center">
              <Image
                src="/assets/book.svg"
                alt="Book Icon"
                width={16}
                height={16}
              />
              <h2 className="text-sm font-medium ml-2 text-customGray-50 mr-1">
                {book.name}
              </h2>
              <CaretDownIcon
                className={cn(
                  "h-4 w-4 text-customGray-200 transition-transform duration-200",
                  expandedBooks[book.id] ? "rotate-0" : "rotate-180"
                )}
              />
            </div>
          </div>
          {expandedBooks[book.id] && (
            <div className="flex flex-col space-y-4">
              {book.chats.map(({ id: chatID, date, title }) => (
                <div key={chatID} className="pl-3">
                  <p className="pl-3 mb-1 text-customGray-100 font-medium text-xs">
                    {date}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-light w-full truncate px-3 py-2 rounded-lg cursor-pointer",
                      "hover:bg-customGray-600",
                      currentChat.bookID === book.id &&
                        currentChat.chatID === chatID &&
                        "bg-customGray-600"
                    )}
                    onClick={() => {}} // TODO: Not doing anything for now
                  >
                    {title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
