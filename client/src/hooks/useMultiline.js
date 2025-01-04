import { useState, useEffect } from "react";

// Custom hook to determine if text should be considered multiline
export const useMultiline = (containerRef) => {
  const [isMultiline, setIsMultiline] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { height } = entry.contentRect;
          const lineHeight = parseInt(
            window.getComputedStyle(container).lineHeight,
            10
          );
          setIsMultiline(height > lineHeight);
        }
      });
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }
  }, [containerRef]);

  return isMultiline;
};
