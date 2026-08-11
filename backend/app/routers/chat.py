import re
import json
import asyncio
from fastapi import APIRouter, HTTPException, status
import google.generativeai as genai
from app.models.chat import ChatRequest, EvaluateSpeechRequest
from app.config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Configure the Gemini API
if settings.GEMINI_API_KEY and "your_actual_gemini_api_key_here" not in settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def is_api_configured() -> bool:
    return bool(settings.GEMINI_API_KEY and "your_actual_gemini_api_key_here" not in settings.GEMINI_API_KEY)

@router.post("/chat")
async def chat_with_gemini(body: ChatRequest):
    if not is_api_configured():
        return {
            "reply": "I'm sorry, I'm not properly configured to chat right now. Please check the API settings.",
            "error": "Gemini API Key is missing in backend .env file"
        }

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
          You are a friendly and professional English tutor. 
          Your goals:
          1. Correct any grammar mistakes in the user's message politely.
          2. Explain the mistakes simply if any.
          3. Keep your response short and encouraging (max 30 words).
          4. Ask one short follow-up question to keep the conversation going.

          User message: "{body.message}"
        """
        
        # Run blocking SDK in executor thread
        response = await asyncio.to_thread(model.generate_content, prompt)
        ai_reply = response.text.strip()
        
        return {"reply": ai_reply}
        
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        return {
            "reply": "I'm having a little trouble thinking right now. Could you try saying that again?",
            "error": str(e)
        }

@router.post("/evaluate-speech")
async def evaluate_speech(body: EvaluateSpeechRequest):
    if not is_api_configured():
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Gemini API Key is missing in backend .env file",
                "feedback": "API Key Error"
            }
        )

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
You are an English pronunciation and language coach AI.

A student was asked to say the word/phrase: "{body.expected}"
The student actually said: "{body.spoken}"

Analyze the student's speech and return a detailed JSON evaluation with these fields:

- pronunciationScore (0-100): How accurately they pronounced "{body.expected}".
- grammarScore (0-100): Grammar quality of what they spoke.
- vocabularyScore (0-100): How rich and correct the vocabulary is relative to the target word.
- mnemonicScore (0-100): Whether the word is memorable/used well in context.
- overallProgress (0-100): Weighted average: pronunciation 40%, grammar 25%, vocabulary 20%, mnemonic 15%.
- levelLabel: one of "Beginner", "Intermediate", "Advanced", or "Expert" based on overallProgress.
- feedback: One encouraging sentence (max 12 words) about what they did well.
- tip: One short improvement tip (max 15 words).
- match: true if pronunciationScore >= 70, else false.

Rules:
- If spoken is completely unrelated to expected, all scores should be very low (5-20).
- Minor case/punctuation differences should NOT penalize.
- Be encouraging but honest.

Return ONLY a valid JSON object. No markdown. No extra text. Example:
{{
  "pronunciationScore": 82,
  "grammarScore": 75,
  "vocabularyScore": 88,
  "mnemonicScore": 70,
  "overallProgress": 80,
  "levelLabel": "Advanced",
  "feedback": "Great effort, your pronunciation is almost perfect!",
  "tip": "Practice the stress on the third syllable.",
  "match": true
}}
        """
        
        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()
        
        try:
            # Locate JSON inside response
            json_match = re.search(r"\{[\s\S]*\}", text)
            if not json_match:
                raise ValueError("No JSON found")
            evaluation = json.loads(json_match.group(0))
            return evaluation
        except Exception as parse_error:
            print(f"AI Parse Error: {text}, error: {parse_error}")
            return {
                "pronunciationScore": 50,
                "grammarScore": 50,
                "vocabularyScore": 50,
                "mnemonicScore": 50,
                "overallProgress": 50,
                "levelLabel": "Intermediate",
                "feedback": "Good attempt! Keep practicing.",
                "tip": "Speak clearly and close to the mic.",
                "match": True
            }
            
    except Exception as e:
        print(f"❌ Speech Evaluation Error: {e}")
        err_msg = str(e)
        
        # Detect API quota errors
        is_quota = "429" in err_msg or "quota" in err_msg.lower() or "resource_exhausted" in err_msg.lower()
        if is_quota:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "API quota exceeded. Please wait a moment and try again.",
                    "isQuota": True
                }
            )
            
        raise HTTPException(
            status_code=500,
            detail={"error": err_msg}
        )
