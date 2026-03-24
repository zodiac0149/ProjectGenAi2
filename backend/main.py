import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from database import engine
import models
import auth
import chat
import analytics

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedCompanion API", version="1.0.0")

# Security: Restrict CORS in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # To be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(analytics.router)

# Security: Global Exception Handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception internally here
    return JSONResponse(
        status_code=500,
        content={"message": "An internal error occurred. Please try again."},
    )

@app.get("/")
def read_root():
    return {"status": "ok", "message": "MedCompanion API is running."}

class HealthCheckResponse(BaseModel):
    status: str
    db: str
    vector_store: str

@app.get("/health", response_model=HealthCheckResponse)
def health_check():
    return {
        "status": "ok",
        "db": "pending",
        "vector_store": "pending"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
