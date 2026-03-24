from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
from database import get_db
import random

router = APIRouter(prefix="/analytics", tags=["Wearable Analytics Engine"])

@router.post("/mock-ingest/{user_id}")
def ingest_mock_wearable_data(user_id: int, db: Session = Depends(get_db)):
    metrics = ["heart_rate", "blood_glucose"]
    for _ in range(5):
        m_type = random.choice(metrics)
        val = random.uniform(60, 110) if m_type == "heart_rate" else random.uniform(80, 180)
        data = models.WearableData(user_id=user_id, metric_type=m_type, value=val)
        db.add(data)
    db.commit()
    return {"status": "success", "message": "Mock data ingested."}

@router.get("/patient-risk-score/{user_id}")
def get_risk_scores(user_id: int, db: Session = Depends(get_db)):
    wearables = db.query(models.WearableData).filter(models.WearableData.user_id == user_id).all()
    high_hr_count = sum(1 for w in wearables if w.metric_type == "heart_rate" and w.value > 100)
    
    logs = db.query(models.InteractionLogs).filter(models.InteractionLogs.user_id == user_id).all()
    flagged_chats = sum(1 for log in logs if log.response and "WARNING" in log.response)
    
    risk_level = "Low"
    if high_hr_count > 2 or flagged_chats > 0:
        risk_level = "High"
    elif high_hr_count > 0:
        risk_level = "Medium"
        
    return {
        "user_id": user_id,
        "risk_level": risk_level,
        "flagged_interactions": flagged_chats,
        "abnormal_readings": high_hr_count
    }

@router.get("/wearable-data/{user_id}")
def get_wearable_data(user_id: int, db: Session = Depends(get_db)):
    data = db.query(models.WearableData).filter(models.WearableData.user_id == user_id).order_by(models.WearableData.timestamp.desc()).limit(20).all()
    return data
