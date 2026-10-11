<<<<<<< HEAD
# NyayaAI (நியாயாAI) — Indian Legal AI Assistant

NyayaAI is an AI-powered legal assistant engineered for Indian law. It grounds legal inquiries in official statutory enactments from **India Code**, the **Bharatiya Nyaya Sanhita (BNS 2023)**, **BNSS 2023**, **BSA 2023**, and landmark **Supreme Court of India judgments**, supporting both **English and Tamil**.

---

## 🏛️ Key Highlights

- **Bilingual Legal AI**: Formulate legal inquiries in English or Tamil (தமிழ்) and receive doctrinal, section-level answers.
- **Retrieved Citation Sourcing**: Responses provide section and judgment citations linking directly to official government repositories.
- **Indian Statutes Covered**: Constitution of India, BNS 2023, BNSS 2023, BSA 2023, Indian Contract Act 1872, IT Act 2000, Consumer Protection Act 2019, CPC 1908, and landmark Supreme Court decisions.
- **Document Assistant**: Drag-and-drop PDF/TXT parsing with PyMuPDF, prompt-injection security scanning, and sandboxed clause Q&A.
- **Standalone Telegram Bot**: Long-polling asynchronous Telegram bot (`python-telegram-bot`) supporting `/start`, `/help`, `/about`, `/language`, `/new`, `/privacy`.
- **Pluggable Hosted AI Provider**: Works with OpenAI, Google Gemini, Anthropic, Groq, or OpenRouter, plus a zero-cost offline **Mock AI engine** for testing without API keys (no Ollama required).
- **Deployment-Ready**: Configured for local development on Windows and one-click cloud deployment on **Render** and **GitHub**.

---

## 📁 Repository Structure

```
nyaya-ai/
├── frontend/                   # React 18, Vite, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, SourceCard, LoadingSkeleton
│   │   ├── pages/              # Landing, Chat, Research, Documents, Settings
│   │   ├── services/           # API client (VITE_API_URL resolver & Mock generator)
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # English & Tamil translations dictionary
│   ├── package.json            # Node dependencies & test scripts
│   ├── vite.config.ts          # Vite & Vitest configuration
│   └── Dockerfile              # Container definition for frontend
├── backend/                    # FastAPI, SQLAlchemy, Pydantic, PyMuPDF
│   ├── app/
│   │   ├── api/                # REST endpoints (/api/chat, /api/health, etc.)
│   │   ├── ai/                 # Hosted AI adapters (OpenAI, Gemini, Mock)
│   │   ├── rag/                # Legal retriever, PyMuPDF parser, chunking
│   │   ├── database/           # SQLite / PostgreSQL engine
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── security/           # File validator, prompt injection detector
│   │   ├── telegram/           # Telegram bot client
│   │   └── config.py           # Environment and PORT configuration
│   ├── tests/                  # Pytest test suite (19 test cases)
│   ├── requirements.txt        # Python backend dependencies
│   └── Dockerfile              # Container definition for backend
├── legal_documents/            # Legal datasets and documentation
├── scripts/                    # Ingestion utilities (ingest_knowledge_base.py)
├── render.yaml                 # Render Blueprint deployment definition
├── docker-compose.yml          # Local Docker orchestration
├── .env.example                # Safe environment variable template
├── .gitignore                  # Git ignore rules (excludes secrets, venv, db)
└── README.md                   # Setup and deployment documentation
```

---

## 💻 Local Windows Setup Guide

### 1. Prerequisites
- **Python 3.11+** installed (`python --version`)
- **Node.js 18+** installed (`node --version`)
- **PowerShell**

### 2. Clone Repository & Setup Environment Files
```powershell
# Copy the safe environment template to .env
Copy-Item .env.example .env
```
> [!NOTE]
> `.env` is listed in `.gitignore` and will never be committed to Git. Keep your real API keys in `.env`.

### 3. Backend Setup
In a PowerShell terminal:
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
cd backend
pip install -r requirements.txt

# Seed the Indian Legal Knowledge Base (creates nyaya_ai.db)
cd ..
python scripts/ingest_knowledge_base.py

# Launch FastAPI backend
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Health Check: `http://127.0.0.1:8000/api/health`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 4. Frontend Setup
In a second PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 5. Running the Telegram Bot (Optional)
1. Message `@BotFather` on Telegram and create a bot using `/newbot`.
2. Add your token to `.env`:
   ```ini
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```
3. Run the bot:
   ```powershell
   cd backend
   python -m app.telegram.bot
   ```

---

## 🧪 Running Automated Tests

### Backend Tests (Pytest)
```powershell
pytest backend/tests/test_nyaya_ai.py -v
```
All 19 automated tests cover:
- `/api/health` and `/api/settings/public`
- Chat request validation
- Bilingual Mock AI generation (English & Tamil)
- RAG retrieval & relevance scoring
- Citation integrity
- Missing credentials & timeout handling
- Telegram message chunking (<= 4000 characters)
- Telegram rate limiting & duplicate update protection
- PDF extraction and malicious `.exe` file upload rejection
- Prompt-injection defense
- Secret redaction

### Frontend Tests (Vitest)
```powershell
cd frontend
npm run test
```

### Production Build Verification
```powershell
cd frontend
npm run build
```

---

## 🚀 GitHub & Render Deployment Guide

### Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) (e.g. `nyaya-ai`). Do **not** initialize with README or `.gitignore`.
2. Push your project from PowerShell:
   ```powershell
   git add .
   git commit -m "Initial release of NyayaAI Indian Legal Assistant"
   git branch -M main
   git remote add origin https://github.com/<your-username>/nyaya-ai.git
   git push -u origin main
   ```

---

### Step 2: Deploy to Render

You can deploy on Render using either **Option A (Blueprint - Recommended)** or **Option B (Manual Services)**.

#### Option A: One-Click Blueprint Deployment (Recommended)
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect [render.yaml](file:///d:/Project%20Lawsri/render.yaml) and configure:
   - **`nyaya-backend`**: Python Web Service running FastAPI.
   - **`nyaya-frontend`**: Static Site building React Vite with SPA rewrites.
5. In the Blueprint parameters, supply your optional keys (or leave default mock mode enabled):
   - `USE_MOCK_AI`: `true` (or `false` if using a live API key)
   - `AI_PROVIDER`: `mock` (or `gemini`, `openai`, `groq`)
   - `AI_API_KEY`: *(Your secret API key)*
6. Click **Apply**.

---

#### Option B: Manual Service Creation on Render

If creating services manually:

**1. Create Backend Web Service:**
- **Name**: `nyaya-backend`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `APP_ENV`: `production`
  - `USE_MOCK_AI`: `true` (or `false` with API key)
  - `AI_PROVIDER`: `mock` (or `gemini`, `openai`)
  - `AI_API_KEY`: *(Your key)*
  - `CORS_ORIGINS`: `*`

**2. Create Frontend Static Site:**
- **Name**: `nyaya-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Redirects / Rewrites**:
  - Add Rule: `/*` -> `/index.html` (Action: `Rewrite`)
- **Environment Variables**:
  - `VITE_API_URL`: `https://nyaya-backend.onrender.com` *(Replace with your actual backend URL)*

---

## 🔒 Security & Legal Boundaries

- **Secret Protection**: `.env` and `nyaya_ai.db` are excluded from version control via `.gitignore`.
- **Dynamic PORT Handling**: The backend automatically resolves `$PORT` injected by Render.
- **CORS Protection**: The API dynamically validates origins and handles wildcard credentials safely.
- **Advocates Act 1961 Notice**: NyayaAI provides educational and statutory research information. It does not solicit clients or substitute for legal counsel from an enrolled advocate.
=======
# NyayaAI-project
>>>>>>> caba7350fb33fed7810506aff9c6f660a0f86066
