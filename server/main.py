from typing import Union
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from services.llm_service import LLMService
import uvicorn
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class MessageRequest(BaseModel):
    message_history: List[Dict[str, Any]]

app = FastAPI()
llm_service = LLMService()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/getAIResponse")
async def getAIResponse(request: MessageRequest):
    print("request", request)
    response_generator = llm_service.generate_stream_responses(request.message_history)
    return StreamingResponse(response_generator, media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)