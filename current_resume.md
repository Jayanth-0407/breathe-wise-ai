SmartSpend AI | Python, LangGraph, Groq API, FastAPI, Pydantic
GitHub– Built a financial agent using LangGraph with a FastAPI backend and configured CORS middleware in FastAPI to
enable cross-origin communication between the Python backend and frontend.– Prevented LLM math errors by routing all financial calculations through Python logic first, then passing only the results
to Llama-3.3-70B to obtain accurate reporting.– Validated user inputs and stripped PII like card numbers and phone patterns using Regex before passing to SQLite.
Cold Chain Logistics System | Python, FastAPI, Streamlit, Docker, Scikit-learn, REST APIs
Live Demo– Built a shipment risk prediction system using FastAPI and Streamlit to predict cold-chain cargo spoilage risks.– Implemented a Random Forest Classifier to assess shipment safety based on route-specific temperature, humidity and
specific cargo constraints.– Developed a CI/CD pipeline using GitHub Actions to deploy a Dockerized FastAPI backend on Microsoft Azure and
frontend on Streamlit dashboard.
Satellite Telemetry Anomaly Detection using Machine Learning | Python, Scikit-learn
Github– Built an anomaly detection system for satellite telemetry, benchmarking 9 ML models for selecting channel-specific
optimal models for better performance.– Tuned hyperparameters via GridSearchCV with Stratified K-Fold to preserve anomaly class distribution across various
folds.– Used the optimal models and tested on 149K+ real in-orbit telemetry data, achieving 11.09% reduction in false
positives