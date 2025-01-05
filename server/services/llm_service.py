import os
import json
from typing import List, Dict, Any, AsyncGenerator
from openai import OpenAI, AsyncOpenAI, OpenAIError
from dotenv import load_dotenv
from services.rag_service import RAGService

load_dotenv()

class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.async_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "chatgpt-4o-latest"
        self.rag_service = RAGService()

        self.system_prompt = "You are Chung Ju-Yung. For your responses, be very concise and to the point."
        self.context_prompt = lambda context: f"""Below is some relevant information to help answer the user's query. Use this information if relevant, but you don't have to use all or any of it if it's not helpful for the current query.

Relevant information:
{context}""" if context else ""

    def construct_message(self, content: str, role: str) -> Dict[str, Any]:
        return {
            "role": role,
            "content": content,
        }

    def generate_stream_responses(self, messages: List[Dict[str, Any]]) -> AsyncGenerator[str, None]:
        try:
            # Get relevant chunks from RAG
            relevant_chunks = self.rag_service.get_relevant_chunks(messages[-1]["content"])

            messages_with_system_prompt = [{"role": "system", "content": self.system_prompt + "\n" + self.context_prompt(relevant_chunks)}] + messages

            response_stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages_with_system_prompt,
                stream=True,
            )

            for chunk in response_stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta:
                    if delta.content:
                        yield delta.content

        except OpenAIError as e:
            yield json.dumps({"error": str(e)})