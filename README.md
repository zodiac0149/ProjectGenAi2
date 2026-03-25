# MedCompanion MVP

An AI-powered healthcare assistant with a Next.js Provider Dashboard and a secure FastAPI Python Backend using Groq LLaMA models.

## Architecture Structure
- `provider-dashboard/`: Next.js 14 Web Application featuring the Patient Chat Assistant UI and Provider Dashboard.
- `backend/`: FastAPI Python application handling AI logic, Guardrails, Authentication via JWT, and Database models (SQLite).

## Setup & Running the Project Locally

### 1. Start the Backend API
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment (Windows):
   ```bash
   .\venv\Scripts\Activate.ps1
   ```
3. Create a `.env` file containing your Groq API key:
   ```env
   GROQ_API_KEY="gsk_your_groq_api_key_here"
   # You can optionally set JWT_SECRET_KEY and DATABASE_URL
   ```
4. Install dependencies (if setting up fresh):
   ```bash
   pip install fastapi uvicorn pydantic sqlalchemy psycopg2-binary python-dotenv PyJWT passlib bcrypt langchain langchain-groq
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be running at http://localhost:8000*

### 2. Start the Provider Dashboard (Frontend)
1. Open a second separate terminal and navigate to the Next.js folder:
   ```bash
   cd provider-dashboard
   ```
2. Install the necessary Node modules:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at http://localhost:3000*

## Data Security & Privacy
This repository relies on `.env` files for secrets (like `GROQ_API_KEY`). **Never** commit your `.env` file to source control. It has been excluded via the root `.gitignore`.
