# BreatheWise AI — Pollution-Aware Fitness & Mobility Assistant

> A production-ready web application for people living in cities affected by air pollution. Empowers urban residents to make healthier daily fitness and mobility decisions based on local air quality, weather, location, health vulnerabilities, and personal preferences.

---

## 🌟 Key Features

1. **Live Air Quality Dashboard (`/dashboard`)**:
   - Observational $PM_{2.5}$, $PM_{10}$, temperature, humidity, and wind dispersion velocity.
   - Dual-source ingestion merging verified **OpenAQ** ground monitoring stations with **Open-Meteo Planetary Air Quality Models**.
   - 24-hour diurnal forecast trend capturing convective boundary layer mixing vs morning thermal inversions.
   - Personalized health guidance based on individual vulnerability (age group, asthma status) without distorting official AQI category breakpoints.

2. **AI Route Explorer & Jogging Loop Planner (`/routes`)**:
   - Interactive **MapLibre GL JS** map with OpenStreetMap cartography.
   - **Goal-Based Jogging Loops**: Generates closed-circuit jogging paths snapped to actual OpenStreetMap pedestrian footpaths and sidewalks via **OSRM**, fulfilling your exact daily fitness goal (3 km, 5 km, 7.5 km, 10 km) with minimum particulate exposure.
   - **Point-to-Point Navigation**: Up to 3 comparative alternatives: **Lowest Exposure**, **Greenest**, and **Fastest**.
   - Transparent proxy indicators evaluating traffic arterial proximity and tree canopy buffers.

3. **Predictive Best Time to Exercise (`/best-time`)**:
   - Analyzes planetary boundary layer convective dilution and nocturnal inversion cycles across 24 hours.
   - Ranks the top 3 activity windows with recommendation scores (0–100), suitability classifications (**Optimal**, **Acceptable**, **Caution**, **Avoid**), and meteorological summaries.

4. **Deterministic Pollution Exposure Estimator**:
   - Models inhaled particulate intake dose ($\mu\text{g}$ of $PM_{2.5}$) based on minute ventilation rates ($V_E = V_0 \times \text{MET}$), activity duration, and route traffic proximity factors.
   - Compares acute intake against the WHO 24-hour air quality guidelines.

5. **Grounded AI Assistant & RAG (`/assistant`)**:
   - Multi-tool agent orchestration using **LangGraph** and **Groq** (`llama-3.3-70b-versatile`).
   - Grounded RAG knowledge base indexing **WHO Global Air Quality Guidelines 2021**, **CPCB National Air Quality Index**, **CDC/NIOSH N95 respirator certifications**, and **US EPA HEPA standards**.
   - Generates exact factual citations with documentation links.

6. **Indoor Exercise Sanctuary & Clean Air Guide (`/indoor`)**:
   - Structured routines (Indoor Walking, Restorative Lung Mobility Yoga, Low-Impact Cardio, Bodyweight Strength) when ambient AQI is hazardous.
   - Practical HEPA air filtration sizing guidance (EPA 2/3 room floor area rule) and cross-ventilation timing.

7. **Activity Tracking & Low-Emission Lifestyle Insights (`/activity`)**:
   - Manual activity logging, weekly fitness goal progress, and session history.
   - **Emissions Calculator**: Quantifies avoided $CO_2e$ greenhouse gas emissions, local tailpipe $PM_{2.5}$, and toxic $NO_x$ avoided by choosing walking or cycling over motor vehicles (DEFRA 2023 factors).
   - Clear scientific distinction between global GHG warming potential and acute localized toxic air pollutants.

8. **User Profile & Privacy Governance (`/profile` & `/onboarding`)**:
   - Strict data minimization: no continuous background GPS tracking without consent.
   - Data sovereignty controls: **Export My Data (JSON)** and **Delete Profile & Clear Activity Data**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, MapLibre GL JS |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn, Cachetools |
| **AI & RAG** | LangGraph, Groq API (`llama-3.3-70b-versatile`), RAG Knowledge Store |
| **Geospatial & Routing** | OpenStreetMap (OSM), Open Source Routing Machine (OSRM demo API) |
| **Environmental Data** | Open-Meteo Air Quality & Weather API (open access, no key required), OpenAQ v3 API |
| **Database** | Render PostgreSQL (or local SQLite fallback) |
| **Deployment** | Docker, Docker Compose, Render (Backend), Vercel (Frontend) |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js v20+ / v22+** and `npm` installed
- (Optional) **Docker Desktop** installed

### 2. Backend Setup
```powershell
cd d:\A_prompt_wars_AQI\backend

# Activate virtual environment
.\.venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run FastAPI backend with hot-reloading
uvicorn app.main:app --reload --port 8000
```
- Health Check: `http://localhost:8000/health`
- Interactive Swagger API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal:
```powershell
cd d:\A_prompt_wars_AQI\frontend

# Run Next.js in development mode
npm run dev
```
- Open your browser at: **`http://localhost:3000`**

### 4. Running via Docker Compose
To launch both frontend and backend in isolated containers:
```powershell
docker-compose up --build
```

---

## 🧪 Automated Testing

The backend includes a comprehensive pytest test suite covering health checks, observational AQI ingestion, forecast parsing, OSRM routing, jogging loops, profile CRUD, exercise windows, exposure modeling, AI chat, indoor workouts, activity logs, and emissions math:

```powershell
cd d:\A_prompt_wars_AQI\backend
.\.venv\Scripts\python.exe -m pytest -v
```
**Test Result: 13 of 13 tests passing.**

---

## 🌐 Production Deployment Guide

### A. Deploy FastAPI Backend on Render
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New + > Web Service**.
3. Select your GitHub repository.
4. Set:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3` (or choose `Docker`)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables in Render:
   - `ENVIRONMENT`: `production`
   - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string (or use Render Postgres)
   - `GROQ_API_KEY`: Your Groq API key (optional for LLM inference)
   - `GROQ_MODEL`: `llama-3.3-70b-versatile`
6. Click **Create Web Service**. Your backend health check will be at:
   `https://your-backend.onrender.com/health`

### B. Deploy Frontend on Vercel
1. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project** and import the repository.
2. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js`
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com`
4. Click **Deploy**. Vercel will build and deploy the application with global CDN caching.

### C. Render PostgreSQL Setup (Automated via Blueprint)
1. When you deploy via `render.yaml`, Render automatically creates the `breathewise-db` PostgreSQL instance.
2. The internal connection string is automatically linked to your backend service.
3. If setting up manually in the Render Dashboard:
   - Click **New + > PostgreSQL**, name it `breathewise-db`.
   - Copy the **Internal Database URL** and set it as `DATABASE_URL` in your backend environment variables.
   - The backend auto-initializes all tables on startup. Optionally, you can execute `backend/migrations/001_initial_schema.sql` via psql or pgAdmin.

---

## ⚖️ Scientific Disclosures & Governance
- **Proxy Indicators**: Proximity to roadways and tree canopy coverage are proxy indicators evaluated from OpenStreetMap data. They do not constitute direct microclimate street sensors.
- **Exposure Dose**: The inhaled particulate dose is calculated as an estimated intake proxy ($C \times V_E \times t$). It does not model individual clinical alveolar deposition or medical diagnosis.
- **Medical Disclaimer**: BreatheWise AI provides environmental and atmospheric risk mitigation recommendations. Always consult a qualified healthcare provider for clinical medical advice.


<!-- cd d:\A_prompt_wars_AQI\backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000 -->