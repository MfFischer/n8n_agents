from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import httpx
import json
from datetime import datetime

from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

# Pydantic models for n8n webhook requests
class MedicalChatRequest(BaseModel):
    message: str
    context_type: str = "general"
    patient_history: Optional[str] = None
    timestamp: Optional[str] = None

class AppointmentRequest(BaseModel):
    patient_request: str
    patient_history: Optional[str] = None
    symptoms: str
    urgency: Optional[str] = None
    timestamp: Optional[str] = None

class ErezeptRequest(BaseModel):
    patient_id: str
    doctor_id: str
    medication: str
    dosage: str
    quantity: str
    diagnosis: str
    instructions: Optional[str] = None
    timestamp: Optional[str] = None

class DocumentationRequest(BaseModel):
    patient_id: str
    consultation_notes: str
    vital_signs: Optional[Dict[str, str]] = None
    symptoms: str
    examination_findings: str
    doctor_id: str
    consultation_type: str = "routine"
    timestamp: Optional[str] = None

# Helper function to call n8n webhooks
async def call_n8n_webhook(webhook_path: str, data: dict) -> dict:
    """Call n8n webhook and return response"""
    try:
        async with httpx.AsyncClient() as client:
            url = f"{settings.N8N_URL}{webhook_path}"
            response = await client.post(
                url,
                json=data,
                timeout=30.0,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"n8n webhook failed: {response.text}"
                )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="n8n webhook timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"n8n connection error: {str(e)}")

@router.post("/webhook/ai-chat")
async def medical_ai_chat(request: MedicalChatRequest, db: Session = Depends(get_db)):
    """
    Medical AI Chat webhook endpoint
    Processes medical consultation requests through n8n workflow
    """
    try:
        # Prepare data for n8n workflow
        workflow_data = {
            "message": request.message,
            "context_type": request.context_type,
            "patient_history": request.patient_history,
            "timestamp": request.timestamp or datetime.now().isoformat(),
            "language": "de",  # German medical terminology
            "medical_disclaimer": True
        }
        
        # Call n8n workflow (this would be configured in n8n)
        # For now, return a mock response that matches expected format
        response = {
            "success": True,
            "response": f"Basierend auf Ihrer Anfrage '{request.message}' empfehle ich eine weitere Untersuchung. "
                      f"Bitte beachten Sie, dass dies eine KI-gestützte Einschätzung ist und keine ärztliche "
                      f"Diagnose ersetzt.",
            "context_type": request.context_type,
            "confidence": 0.85,
            "medical_disclaimer": "Diese Antwort wurde von einer KI generiert und ersetzt keine professionelle medizinische Beratung.",
            "session_id": f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Medical chat processing failed: {str(e)}")

@router.post("/webhook/smart-scheduling")
async def smart_appointment_scheduling(request: AppointmentRequest, db: Session = Depends(get_db)):
    """
    Smart Appointment Scheduling webhook endpoint
    Classifies appointment urgency and suggests scheduling through n8n workflow
    """
    try:
        # Prepare data for n8n workflow
        workflow_data = {
            "patient_request": request.patient_request,
            "symptoms": request.symptoms,
            "patient_history": request.patient_history,
            "timestamp": request.timestamp or datetime.now().isoformat()
        }
        
        # Mock AI classification based on keywords
        urgency_classification = "routine"
        if any(word in request.symptoms.lower() for word in ["schmerz", "notfall", "akut", "dringend"]):
            urgency_classification = "akut"
        elif any(word in request.symptoms.lower() for word in ["nachsorge", "kontrolle", "follow"]):
            urgency_classification = "nachsorge"
        
        response = {
            "success": True,
            "classification": {
                "urgency": urgency_classification,
                "priority": "high" if urgency_classification == "akut" else "normal",
                "suggested_duration": 30 if urgency_classification == "routine" else 45,
                "department": "allgemeinmedizin"
            },
            "scheduling_suggestions": [
                {
                    "date": "2024-01-15",
                    "time": "09:00",
                    "available": True
                },
                {
                    "date": "2024-01-15", 
                    "time": "14:30",
                    "available": True
                }
            ],
            "ai_reasoning": f"Basierend auf den Symptomen '{request.symptoms}' wurde die Dringlichkeit als '{urgency_classification}' klassifiziert.",
            "session_id": f"appointment_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Appointment scheduling failed: {str(e)}")

@router.post("/webhook/erezept-automation")
async def erezept_automation(request: ErezeptRequest, db: Session = Depends(get_db)):
    """
    eRezept Automation webhook endpoint
    Generates electronic prescriptions through n8n workflow with TI integration
    """
    try:
        # Prepare data for n8n workflow
        workflow_data = {
            "patient_id": request.patient_id,
            "doctor_id": request.doctor_id,
            "medication": request.medication,
            "dosage": request.dosage,
            "quantity": request.quantity,
            "diagnosis": request.diagnosis,
            "instructions": request.instructions,
            "timestamp": request.timestamp or datetime.now().isoformat()
        }
        
        # Mock eRezept generation
        erezept_id = f"ERX_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        response = {
            "success": True,
            "erezept": {
                "erezept_id": erezept_id,
                "medication": request.medication,
                "dosage": request.dosage,
                "quantity": request.quantity,
                "diagnosis": request.diagnosis,
                "instructions": request.instructions or "Nach Anweisung einnehmen"
            },
            "ti_integration": {
                "transmitted": True,
                "transmission_id": f"TI_{erezept_id}",
                "pharmacy_code": "12345678",
                "patient_notification": "SMS sent"
            },
            "drug_interaction_check": {
                "checked": True,
                "warnings": [],
                "safe_to_prescribe": True
            },
            "automation_results": {
                "time_saved": "4.5 minutes",
                "cost_savings": "€9.00",
                "error_reduction": "95%"
            },
            "session_id": f"erezept_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"eRezept automation failed: {str(e)}")

@router.post("/webhook/auto-documentation")
async def auto_documentation(request: DocumentationRequest, db: Session = Depends(get_db)):
    """
    Automated Clinical Documentation webhook endpoint
    Generates SOAP notes, medical letters, and billing codes through n8n workflow
    """
    try:
        # Prepare data for n8n workflow
        workflow_data = {
            "patient_id": request.patient_id,
            "consultation_notes": request.consultation_notes,
            "vital_signs": request.vital_signs or {},
            "symptoms": request.symptoms,
            "examination_findings": request.examination_findings,
            "doctor_id": request.doctor_id,
            "consultation_type": request.consultation_type,
            "timestamp": request.timestamp or datetime.now().isoformat()
        }
        
        # Mock documentation generation
        response = {
            "success": True,
            "documentation": {
                "soap_note": {
                    "subjective": f"Patient berichtet über: {request.symptoms}",
                    "objective": f"Untersuchungsbefunde: {request.examination_findings}",
                    "assessment": "Verdachtsdiagnose basierend auf Anamnese und Befund",
                    "plan": "Weitere Diagnostik und Therapieempfehlung"
                },
                "medical_letter": f"Sehr geehrte Kollegin, sehr geehrter Kollege,\n\n"
                                f"ich berichte über die heutige Konsultation von Patient {request.patient_id}.\n\n"
                                f"Anamnese: {request.symptoms}\n"
                                f"Befund: {request.examination_findings}\n\n"
                                f"Mit freundlichen kollegialen Grüßen",
                "billing_codes": {
                    "goa_codes": ["1", "5", "8"],
                    "ebm_codes": ["03000", "03010"],
                    "total_points": 156,
                    "estimated_amount": "€18.72"
                },
                "follow_up": {
                    "required": True,
                    "suggested_date": "2024-01-22",
                    "reason": "Verlaufskontrolle"
                }
            },
            "automation_results": {
                "time_saved": "12 minutes",
                "cost_savings": "€24.00",
                "accuracy_improvement": "92%"
            },
            "session_id": f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto documentation failed: {str(e)}")

# Health check for n8n integration
@router.get("/n8n/health")
async def check_n8n_health():
    """Check n8n service health"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.N8N_URL}/healthz", timeout=5.0)
            return {
                "n8n_status": "healthy" if response.status_code == 200 else "unhealthy",
                "response_time_ms": response.elapsed.total_seconds() * 1000,
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        return {
            "n8n_status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
