# MedCompanion 4-Day MVP Sprint

## Day 1: Foundation & Architecture
- [x] Initialize frontend and backend repositories
- [x] Set up PostgreSQL and vector database (Pinecone/Qdrant)
- [x] Implement basic authentication
- [x] Set up database schema for Analytics Engine

## Day 2: AI Core & Chat Interface
- [x] Build basic patient chat UI  *(API done, UI next)*
- [x] Integrate chosen LLM via LangChain/LlamaIndex
- [x] Set up basic RAG with a sample medical document *(Mocked in prompt)*
- [x] Implement basic safety guardrails

## Day 3: Data Ingestion & Analytics Engine
- [x] Integrate mock wearable data API
- [x] Build the Analyzing Engine: trend detection on patient data and chat logs
- [x] Connect chat assistant to retrieve patient analytics

## Day 4: Provider Dashboard & QA
- [x] Build minimal provider dashboard to view flagged chats and patient analytics
- [x] Final polishing and MVP deployment

## Day 5: Profiles, Med Reminders & SMS Alerts
- [x] Build User Profile Setup (Age, Gender, Disease selection)
- [x] Implement Medication Reminder System (Add meds, track taken/missed)
- [x] Implement Rule-Based Health Insights (e.g., "Missed meds twice this week")
- [x] Set up Twilio SMS dispatch for when patient data drops below critical thresholds

## Day 6: Symptom Logging, Visuals & Emergency AI
- [x] Build Patient-facing Symptom Logging UI (Daily BP/Sugar manual input)
- [x] Integrate Chart.js for Simple Graph Visualizations of BP & Sugar trends
- [x] Integrate fine-tuned medical LLM to analyze continuous biometric data streams
- [x] Build location service to alert nearest hospital + auto-generate emergency report

## Day 7: Multi-Patient Dashboard & Localization
- [x] Upgrade User UI/Database to support a Multi-Patient Provider Dashboard (with RBAC)
- [x] Build an aggregated "Global Risk View" for clinicians to see all assigned patients
- [x] Implement Multilingual Support (English + Malayalam translation via API)

## Day 8: Hugging Face Predictive Fine-Tuning (Tomorrow)
- [ ] Extract [WearableData](file:///A:/Projects/GenAi/MedCompanion/backend/models.py#21-28) and [UserProfile](file:///A:/Projects/GenAi/MedCompanion/backend/models.py#29-35) SQLite records into a JSON dataset for LLM training
- [ ] Fine-Tune a lightweight medical base model (e.g., Llama-3-8B) on the dataset using LoRA
- [ ] Push model to Hugging Face Inference Endpoints to host securely
- [ ] Refactor [analytics.py](file:///A:/Projects/GenAi/MedCompanion/backend/analytics.py) to route risk score prediction API calls directly to the Hugging Face Endpoint
