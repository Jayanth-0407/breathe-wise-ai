CONTEXT: BreatheWise AI Project Overview
1. Identity & Problem Statement
Name: BreatheWise AI
What it is: A personalized air quality intelligence, clean-routing, and physiological pollution-exposure tracking web application.
Problem Solved: Traditional weather/AQI apps provide passive numbers (e.g., "AQI 220") without answering actionable health questions: "Is it safe to run?", "Which commute route minimizes inhaled toxic particulate?", or "How much PM2.5 did my lungs actually absorb?" In polluted urban centers, exercising in high AQI can cause severe pulmonary and cardiovascular damage that negates the benefits of exercise.
2. Core Features & Novel Architecture
Physiological Inhaled Dose Modeling: Calculates actual absorbed micrograms (µg) of PM2.5/PM10 using metabolic equivalent rates: Inhaled Dose = V_E × Duration × Pollutant Concentration (where minute ventilation V_E scales with basal rate V_0 and activity MET: walking = 3.5 MET, cycling = 7.5 MET, running = 9.8 MET; calibrated for adult vs child lung capacities).
Clean Exposure Routing: Integrates routing with geospatial air quality interpolation to recommend routes with the lowest cumulative particulate intake, not just shortest distance.
Diurnal Best-Time Windows: Analyzes 24-hour forecast data against atmospheric inversion cycles to score safe outdoor exercise windows (Poor vs Moderate vs Optimal).
Indoor Workout & Filtration Hub: Suggests indoor bodyweight/cardio alternatives and HEPA filtration runtimes when outdoor AQI exceeds safe thresholds.
Real-Time AI Health Assistant: AI advisor grounded in live localized pollutant data (PM2.5, PM10, NO2, O3, SO2, CO) and user health profiles (asthma, cardiovascular risks).
3. Tech Stack
Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Leaflet/MapLibre, Lucide React, Error Boundaries.
Backend: Python 3.11, FastAPI, Pydantic v2, AnyIO, Pytest.
APIs & Data Sources: Open-Meteo Air Quality & Weather API, OSRM (Open Source Routing Machine), Google Gemini API (for conversational health advice).
Code Standards: Strict TypeScript (zero any), modular single-responsibility hooks & components (<130 lines/file), full .env secret hygiene, 100% passing test suite (28/28 backend unit & resilience tests).
4. Audience & Use Case

Target users are urban runners, cyclists, commuters, parents, and sensitive individuals (asthmatics) in polluted metropolitan areas looking to balance cardiovascular fitness with respiratory safety.