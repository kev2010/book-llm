import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/chat/ChatPanel";
import Thread from "../components/Thread";
import { fetchAIResponse } from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [books, setBooks] = useState([
    {
      id: 0,
      name: "Born Of This Land",
      chats: [{ id: 0, date: "Today", title: "New Chat" }],
    },
  ]);
  const [currentChat, setCurrentChat] = useState({
    bookID: 0,
    chatID: 0,
    // TODO: Will need something like updateTime for cache busting when we have chats in S3 bucket
    // updateTime: "",
  });
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m Chung Ju-Yung! My family and I grew up so poor that we once had to eat tree bark to survive. Since then, I've done a lot of things in my life: creating Hyundai, helping bring the 1988 Seoul Olympics to my country, and even driving 1,001 cows across the DMZ to promote peace with North Korea. \n\n What would you like to know about me?",
    },
  ]);
  // TODO: Threads data is local for now
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(-1);
  const [prefillThreadText, setPrefillThreadText] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const bufferRef = useRef("");
  const intervalIdRef = useRef(null);
  const finishedResponding =
    bufferRef.current.length === 0 && !isGeneratingResponse;

  const getAIResponse = async () => {
    if (isGeneratingResponse) {
      return;
    }

    setIsGeneratingResponse(true);

    // Parse the stream and append the message to the state
    const reader = await fetchAIResponse(messages);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setIsGeneratingResponse(false);
        break;
      }

      bufferRef.current += new TextDecoder().decode(value);
    }
  };

  const sendMessage = (message) => {
    setMessages([...messages, { role: "user", content: message }]);
  };

  // Toggles what thread is currently being viewed (id is -1 if no thread is being viewed)
  const viewThread = (id) => {
    setCurrentThread(id);
  };

  // Since we're storing threads locally, we need to update the thread with the given id with the new messages
  const updateThread = (id, messages) => {
    setThreads((prevThreads) => {
      return prevThreads.map((thread) =>
        thread.id === id ? { ...thread, messages } : thread
      );
    });
  };

  // Creates a new thread associated with the given message id
  // Also auto sets the current thread to the new thread + prefills the thread with the message content + prefills input box
  const createNewThread = (messageID, selection) => {
    setThreads((prevThreads) => [
      ...prevThreads,
      {
        id: messageID,
        messages: [
          {
            role: "assistant",
            content: messages[messageID].content,
          },
        ],
      },
    ]);
    setCurrentThread(messageID);
    setPrefillThreadText(
      `"""
${selection}
"""
`
    );
  };

  // Generate an AI response when the user sends a message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      getAIResponse();
    }
  }, [messages]);

  // To make streaming smoother, we use a buffer to store the AI response and append it to the state (otherwise it's way too fast)
  useEffect(() => {
    if (isGeneratingResponse) {
      setCurrentMessage("");
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current); // Clear any existing interval
      }

      intervalIdRef.current = setInterval(() => {
        if (finishedResponding) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }

        if (bufferRef.current.length > 0) {
          const nextChar = bufferRef.current.charAt(0);
          bufferRef.current = bufferRef.current.slice(1); // Remove the first character

          setCurrentMessage((prevMessage) => prevMessage + nextChar);
        }
      }, 15);
    }
  }, [isGeneratingResponse]);

  // We have a second buffer to store the current message and append it to the state
  // I think this is necessary because using "setMessages" in a setInterval is a stale closure, so it always has an old value and thus overwrites itself
  useEffect(() => {
    if (currentMessage.length > 0) {
      const toAdd = currentMessage;
      setCurrentMessage("");

      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const isLastMessageFromUser = lastMessage.role === "user";

        return isLastMessageFromUser
          ? [...prevMessages, { role: "assistant", content: toAdd }]
          : [
              ...prevMessages.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + toAdd,
              },
            ];
      });
    }
  }, [currentMessage]);

  useEffect(() => {
    // Cleanup interval when component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full min-h-screen w-full flex flex-row bg-customGray-800 [&_::selection]:bg-primaryLight/50 [&_::selection]:text-white">
      <div className="w-72 hidden lg:block flex-shrink-0">
        <Sidebar
          books={books}
          currentChat={currentChat}
          setShowAlert={setShowAlert}
        />
      </div>
      <div className="relative w-full hidden lg:flex lg:flex-row bg-customGray-900 border-l border-customGray-400">
        <AnimatePresence>
          <motion.div
            className="relative w-full bg-customGray-900 border-l border-customGray-400"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              width: currentThread !== -1 ? "calc(100% - 30rem)" : "100%",
            }}
            transition={{
              opacity: { duration: 0.5 },
              width: { duration: 0.2, ease: "easeInOut" },
            }}
          >
            <ChatPanel
              messages={messages}
              sendMessage={sendMessage}
              showAlert={showAlert}
              setShowAlert={setShowAlert}
              finishedResponding={finishedResponding}
              viewThread={viewThread}
              threads={threads}
              createNewThread={createNewThread}
            />
          </motion.div>
        </AnimatePresence>
        {currentThread !== -1 && (
          <div className="w-[30rem] flex flex-col border-l border-customGray-400">
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{
                x: { duration: 0.2, ease: "easeInOut" },
                opacity: { duration: 0.2 },
              }}
            >
              <Thread
                threads={threads}
                currentThread={currentThread}
                viewThread={viewThread}
                updateThread={updateThread}
                prefillThreadText={prefillThreadText}
              />
            </motion.div>
          </div>
        )}
      </div>

      <div className="lg:hidden w-full h-screen flex flex-col justify-center items-center text-lg text-customGray-50 bg-customGray-800 p-4">
        Please view on laptop! This isn&apos;t made to be responsive
      </div>
    </div>
  );
}
