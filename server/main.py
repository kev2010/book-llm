from typing import Union
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from services.llm_service import LLMService
import uvicorn
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class MessageRequest(BaseModel):
    message_history: List[Dict[str, Any]]

class TestFailureRequest(BaseModel):
    test_name: str
    error_message: str
    error_context: str = ""
    test_code: str = ""
    screenshot: str = ""
    error_context_md: str = ""

app = FastAPI()
llm_service = LLMService()

@app.post("/getAIResponse")
async def getAIResponse(request: MessageRequest):
    response_generator = llm_service.generate_stream_responses(request.message_history)
    return StreamingResponse(response_generator, media_type="text/event-stream")

@app.post("/classifyTestFailure")
async def classify_test_failure(request: TestFailureRequest):
    result = await llm_service.classify_test_failure(
        test_name=request.test_name,
        error_message=request.error_message,
        error_context=request.error_context
    )
    return {"classification": result}

@app.post("/selfHealTest")
async def self_heal_test(request: TestFailureRequest):
    result = await llm_service.self_heal_test(
        test_name=request.test_name,
        error_message=request.error_message,
        error_context=request.error_context,
        test_code=request.test_code,
        screenshot=request.screenshot,
        error_context_md=request.error_context_md
    )
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)