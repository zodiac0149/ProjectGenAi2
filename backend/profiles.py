from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import models
from database import get_db
from auth import get_current_user
import os

router = APIRouter(prefix="/patients", tags=["Patient Profiles & Meds"])

class ProfileUpdate(BaseModel):
    age: int
    gender: str
    disease_flags: str

class MedCreate(BaseModel):
    name: str
    dosage: str
    schedule_time: str

@router.post("/{user_id}/profile")
def update_profile(user_id: int, profile: ProfileUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "provider":
         raise HTTPException(status_code=403, detail="Not authorized.")
    
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    if not db_profile:
        db_profile = models.UserProfile(user_id=user_id, **profile.model_dump())
        db.add(db_profile)
    else:
        db_profile.age = profile.age
        db_profile.gender = profile.gender
        db_profile.disease_flags = profile.disease_flags
    db.commit()
    return {"status": "success", "profile": profile}

@router.post("/{user_id}/medications")
def add_medication(user_id: int, med: MedCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "provider":
         raise HTTPException(status_code=403, detail="Not authorized.")
         
    new_med = models.Medication(user_id=user_id, **med.model_dump())
    db.add(new_med)
    db.commit()
    return {"status": "success", "message": "Medication added"}

@router.post("/medications/{med_id}/log")
def log_medication(med_id: int, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    med = db.query(models.Medication).filter(models.Medication.id == med_id).first()
    if not med or (current_user.id != med.user_id and current_user.role != "provider"):
        raise HTTPException(status_code=403, detail="Not authorized.")
        
    log = models.MedicationLog(medication_id=med_id, status=status) # e.g. "taken" or "missed"
    db.add(log)
    db.commit()
    
    # DAY 5: Rule-Based Health Insight & Twilio SMS Alert Check
    missed_count = db.query(models.MedicationLog).filter(
        models.MedicationLog.medication_id == med_id,
        models.MedicationLog.status == "missed"
    ).count()
    
    insight = None
    if status == "missed" and missed_count >= 2:
        insight = "You have missed this medication multiple times. Please consult your schedule."
        # MOCK SMS DISPATCH (Wait for full integration)
        print(f"[TWILIO DISPATCH] Alerting Provider: Patient {med.user_id} critically missed medication {med.name} {missed_count} times.")
            
    return {"status": "success", "insight": insight}
