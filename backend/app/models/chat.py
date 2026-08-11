from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class EvaluateSpeechRequest(BaseModel):
    expected: str
    spoken: str
