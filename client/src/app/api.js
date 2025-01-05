// This file is a collection of functions that interact with the NextJS API

export const fetchAIResponse = async (messageHistory) => {
  const apiEndpoint = "/api/chat/getAIResponse";

  // Call the getAIResponse API endpoint
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messageHistory }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch AI response: ${response.statusText}`);
  }

  // Return readable stream
  return response.body.getReader();
};
