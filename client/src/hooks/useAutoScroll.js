import { useEffect, useState } from "react";

/*
    Functionality:
    - If user sends message, it should snap to bottom and start auto scrolling 
    - When bot sends message, it should start auto scrolling if user at the bottom 
    - If user tries to scroll up, auto scrolling stops. 
*/
export const useAutoScroll = (messages, messagesContainerRef) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (messagesContainerRef.current && isFirstLoad) {
      // Initially hide the container to prevent flicker
      messagesContainerRef.current.style.visibility = "hidden";
    }

    if (messages.length === 0) {
      setIsFirstLoad(true);
      return;
    }

    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: isFirstLoad ? "auto" : "smooth",
        });
        if (isFirstLoad) {
          setIsFirstLoad(false);
          // Reveal the container after the first load
          container.style.visibility = "visible";
        }
      });
    }
  }, [messages, isFirstLoad]);
};
