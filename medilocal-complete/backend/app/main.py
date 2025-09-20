from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import os
from pathlib import Path

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, patients, ai, compliance, appointments, n8n_integration
from app.core.security import get_current_user
from app.services.audit_service import AuditService

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediLocal AI",
    description="Local AI Assistant for German Clinics and Doctors",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs("data/uploads", exist_ok=True)
os.makedirs("data/processed", exist_ok=True)
os.makedirs("logs", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="data"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["compliance"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(n8n_integration.router, prefix="", tags=["n8n-integration"])

@app.get("/")
async def root():
    return {
        "message": "MediLocal AI - Local AI Assistant for German Clinics",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        from app.core.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()

        # Check n8n connection
        import httpx
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{settings.N8N_URL}/healthz", timeout=5.0)
                n8n_status = response.status_code == 200
            except:
                n8n_status = False

        # Check Ollama connection
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{settings.OLLAMA_URL}/api/tags", timeout=5.0)
                ollama_status = response.status_code == 200
            except:
                ollama_status = False

        return {
            "status": "healthy",
            "database": "connected",
            "n8n": "connected" if n8n_status else "disconnected",
            "ollama": "connected" if ollama_status else "disconnected",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": "2024-01-01T00:00:00Z"
            }
        )

@app.get("/system/workflows/status")
async def get_workflow_status():
    """Get n8n workflow status"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            # Check if n8n is running
            try:
                response = await client.get(f"{settings.N8N_URL}/healthz", timeout=5.0)
                n8n_running = response.status_code == 200
            except:
                n8n_running = False

        # Return workflow status (assume all are working if n8n is running)
        workflows = {
            "medical_chat": n8n_running,
            "appointments": n8n_running,
            "erezept": n8n_running,
            "documentation": n8n_running
        }

        return workflows
    except Exception as e:
        return {
            "medical_chat": False,
            "appointments": False,
            "erezept": False,
            "documentation": False
        }

@app.get("/dashboard/metrics")
async def get_dashboard_metrics():
    """Get dashboard metrics"""
    from datetime import datetime
    import random

    # For now, return mock data - in production this would query the database
    return {
        "patients_today": random.randint(15, 25),
        "pending_appointments": random.randint(5, 15),
        "erezepts_generated": random.randint(8, 18),
        "documents_created": random.randint(12, 22),
        "time_saved_hours": round(random.uniform(3.5, 8.5), 1),
        "cost_savings_euros": random.randint(420, 1020),
        "last_updated": datetime.now().isoformat()
    }

@app.get("/dashboard/activity")
async def get_recent_activity(limit: int = 10):
    """Get recent activity"""
    from datetime import datetime, timedelta
    import random

    # Mock recent activity data
    activities = []
    activity_types = ["medical_chat", "appointment", "erezept", "documentation"]
    patient_names = ["Max Mustermann", "Anna Schmidt", "Peter Weber", "Maria Fischer", "Hans Mueller"]

    for i in range(min(limit, 10)):
        activity = {
            "id": f"activity_{i+1}",
            "type": random.choice(activity_types),
            "patient_name": random.choice(patient_names),
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(5, 120))).isoformat(),
            "status": random.choice(["completed", "pending"]),
            "details": f"Processed {random.choice(activity_types).replace('_', ' ')}"
        }
        activities.append(activity)

    return activities

# Basic data endpoints for metrics calculation
@app.get("/patients")
async def get_patients(date: str = None):
    """Get patients count for a specific date"""
    import random
    return {"count": random.randint(15, 25)}

@app.get("/appointments")
async def get_appointments(status: str = None):
    """Get appointments count by status"""
    import random
    return {"count": random.randint(5, 15)}

@app.get("/erezepts")
async def get_erezepts(date: str = None):
    """Get eRezepts count for a specific date"""
    import random
    return {"count": random.randint(8, 18)}

@app.get("/documents")
async def get_documents(date: str = None):
    """Get documents count for a specific date"""
    import random
    return {"count": random.randint(12, 22)}

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload medical document for processing"""
    try:
        # Validate file type
        allowed_types = ["application/pdf", "text/plain", "application/msword", 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Save file
        file_path = f"data/uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Log the upload
        audit_service = AuditService()
        await audit_service.log_action(
            user_id=current_user["id"],
            action="file_upload",
            details={"filename": file.filename, "size": len(content)}
        )
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "size": len(content),
            "path": file_path
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
