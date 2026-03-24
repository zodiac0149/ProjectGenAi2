import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import models
from database import get_db

try:
    from langchain_groq import ChatGroq
    from langchain.schema import SystemMessage, HumanMessage
    # Llama 3 is blazing fast and extremely capable for health context
    llm = ChatGroq(model_name="llama3-8b-8192", temperature=0)
except Exception:
    llm = None

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    user_id: int
    message: str

class ChatResponse(BaseModel):
    reply: str
    flagged: bool

MEDICAL_GUARDRAIL_PROMPT = """
You are MedCompanion, an AI health assistant.
RULES:
1. Do NOT provide medical diagnoses or prescribe medications.
2. If the user reports severe symptoms (e.g., chest pain, extreme dizziness), immediately advise them to seek emergency medical care and flag the conversation.
3. Provide general educational information based on verified guidelines.
"""

@router.post("/", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    flagged = False
    
    log = models.InteractionLogs(user_id=request.user_id, query=request.message)
    db.add(log)
    
    lower_msg = request.message.lower()
    if any(word in lower_msg for word in ["chest pain", "heart attack", "can't breathe", "dizzy", "fainting"]):
        flagged = True
        reply = "WARNING: It sounds like you are experiencing a medical emergency. Please call 911 or go to the nearest emergency room immediately."
    else:
        if llm and os.getenv("GROQ_API_KEY"):
            messages = [
                SystemMessage(content=MEDICAL_GUARDRAIL_PROMPT),
                HumanMessage(content=request.message)
            ]
            reply = llm.invoke(messages).content
        else:
            reply = "I am currently in MVP offline mode. Please configure the GROQ_API_KEY to enable full AI responses. Remember to consult a doctor for medical advice."
    
    log.response = reply
    db.commit()
    
    return ChatResponse(reply=reply, flagged=flagged)
