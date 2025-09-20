from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
import httpx

app = FastAPI(
    title="MediLocal AI",
    description="Local AI Assistant for German Clinics and Doctors",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MediLocal AI Backend is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "medilocal-backend"}

# Dashboard endpoints
@app.get("/dashboard/metrics")
async def get_dashboard_metrics():
    return {
        "patients_today": 12,
        "pending_appointments": 8,
        "erezepts_generated": 15,
        "documents_created": 23,
        "time_saved_hours": 4.2,
        "cost_savings_euros": 504,
        "last_updated": datetime.now().isoformat()
    }

@app.get("/dashboard/activity")
async def get_recent_activity(limit: int = Query(10, ge=1, le=50)):
    activities = [
        {
            "id": "act_001",
            "type": "medical_chat",
            "patient_name": "Max Mustermann",
            "timestamp": datetime.now().isoformat(),
            "status": "completed",
            "details": "AI-Beratung zu Kopfschmerzen abgeschlossen"
        },
        {
            "id": "act_002",
            "type": "appointment",
            "patient_name": "Anna Schmidt",
            "timestamp": datetime.now().isoformat(),
            "status": "pending",
            "details": "Termin für Vorsorgeuntersuchung geplant"
        }
    ]
    return activities[:limit]

# System status endpoints
@app.get("/system/workflows/status")
async def get_workflow_status():
    # Check n8n workflows status
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://n8n:5678/healthz", timeout=5.0)
            n8n_healthy = response.status_code == 200
    except:
        n8n_healthy = False

    return {
        "medical_chat": n8n_healthy,
        "appointments": n8n_healthy,
        "erezept": n8n_healthy,
        "documentation": n8n_healthy
    }

# Patient endpoints
@app.get("/patients")
async def get_patients(date: Optional[str] = None):
    return {"count": 12, "patients": []}

@app.get("/appointments")
async def get_appointments(status: Optional[str] = None):
    return {"count": 8, "appointments": []}

@app.get("/erezepts")
async def get_erezepts(date: Optional[str] = None):
    return {"count": 15, "erezepts": []}

@app.get("/documents")
async def get_documents(date: Optional[str] = None):
    return {"count": 23, "documents": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
