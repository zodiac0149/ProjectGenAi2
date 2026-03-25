# MedCompanion Deployment & Configuration Guide

This runbook outlines exactly what code modifications you must make to connect live emergency SMS services, scale your APIs, and instantly deploy the platform live onto Vercel and Render for free.

## 1. Connecting Live SMS Dispatch (Twilio)
To physically send text messages when medical vitals drop or medications are skipped, you need a Twilio account.
1. Sign up at [Twilio.com](https://www.twilio.com/) and copy your `Account SID`, `Auth Token`, and your assigned `Twilio Phone Number`.
2. Go into your backend codebase: [A:\Projects\GenAi\MedCompanion\backend\profiles.py](file:///A:/Projects/GenAi/MedCompanion/backend/profiles.py). Search for the [log_medication](file:///A:/Projects/GenAi/MedCompanion/backend/profiles.py#49-72) rule-based check at the bottom of the file (`if status == "missed" and missed_count >= 2:`).
3. Replace the mock `print()` statement with this live Twilio python code injection:
```python
from twilio.rest import Client
import os

client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
message = client.messages.create(
    body=f"🚨 URGENT: Patient #{med.user_id} critically missed medication {med.name} multiple times.",
    from_=os.getenv("TWILIO_PHONE_NUMBER"),
    to="+1234567890" # Your Doctor's real phone number
)
```
4. Add those three new variables (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`) into your Cloud platform's Environment Variables panel.

## 2. Deploying the FastAPI Backend (Render)
1. I have successfully generated the `requirements.txt` file in your system. This automatically tells the cloud server what libraries to install.
2. Go to [Render](https://render.com/), link your GitHub, and create a **New Web Service**.
3. Point it to your `ProjectGenAi2` repository.
4. Set the **Root Directory** to: `backend`
5. Set the **Build Command** to: `pip install -r requirements.txt`
6. Set the **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port 10000`
7. Click **Advanced Options** and paste in your secret `GROQ_API_KEY`.
8. Click **Deploy**. When it finishes, Render will give you a public URL (e.g., `https://medcompanion-api.onrender.com`).

## 3. Linking & Deploying the Frontend (Vercel)
Right now, your React application is hardcoded to talk to your laptop (`http://localhost:8000`). We must change this so it talks to your new Render cloud server.
1. Open [A:\Projects\GenAi\MedCompanion\provider-dashboard\src\app\page.tsx](file:///A:/Projects/GenAi/MedCompanion/provider-dashboard/src/app/page.tsx).
2. Run a "Find and Replace All" inside the file editor.
   - **Find:** `http://localhost:8000`
   - **Replace with:** Your new Render URL from Step 2 (e.g., `https://medcompanion-api.onrender.com`)
3. Save the file and push that single modification to your GitHub repository.
4. Go to [Vercel](https://vercel.com/) and click **Import Project**.
5. Select your `ProjectGenAi2` repository.
6. Edit the Vercel configuration to explicitly select `provider-dashboard` as the Root Directory.
7. Click **Deploy**. Vercel will handle the rest and launch your live, public Next.js app in 90 seconds!
