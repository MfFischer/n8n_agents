from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.ai_service import AIService
from app.services.anonymization_service import AnonymizationService
from app.services.audit_service import AuditService
from app.models.patient import AIInteraction

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    patient_id: Optional[str] = None
    context_type: str = "general"  # general, diagnosis, treatment, summary

class ChatResponse(BaseModel):
    response: str
    confidence: str
    disclaimer: str
    processing_time: int
    model_used: str
    session_id: str

class SummarizeRequest(BaseModel):
    text: str
    patient_id: Optional[str] = None
    summary_type: str = "consultation"  # consultation, history, treatment

class DiagnosisRequest(BaseModel):
    symptoms: str
    patient_history: Optional[str] = None
    patient_id: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Chat with the AI assistant"""
    try:
        ai_service = AIService()
        audit_service = AuditService()
        
        # Process the request
        result = await ai_service.process_chat(
            message=request.message,
            patient_id=request.patient_id,
            context_type=request.context_type,
            user_id=current_user["id"]
        )
        
        # Log the interaction
        background_tasks.add_task(
            audit_service.log_ai_interaction,
            user_id=current_user["id"],
            query=request.message,
            response=result["response"],
            model_used=result["model_used"],
            processing_time=result["processing_time"],
            patient_id=request.patient_id,
            interaction_type=request.context_type
        )
        
        return ChatResponse(
            response=result["response"],
            confidence=result["confidence"],
            disclaimer="⚠️ Dies ist eine KI-generierte Unterstützung. Konsultieren Sie immer Ihr professionelles medizinisches Urteil.",
            processing_time=result["processing_time"],
            model_used=result["model_used"],
            session_id=result["session_id"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

@router.post("/summarize")
async def summarize_text(
    request: SummarizeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Summarize medical text"""
    try:
        ai_service = AIService()
        anonymization_service = AnonymizationService()
        
        # Anonymize the text first
        anonymized_text = await anonymization_service.anonymize_text(request.text)
        
        # Generate summary
        result = await ai_service.summarize_medical_text(
            text=anonymized_text,
            summary_type=request.summary_type,
            patient_id=request.patient_id
        )
        
        # Log the action
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="text_summarization",
            details={
                "summary_type": request.summary_type,
                "text_length": len(request.text),
                "patient_id": request.patient_id
            }
        )
        
        return {
            "summary": result["summary"],
            "key_points": result["key_points"],
            "confidence": result["confidence"],
            "processing_time": result["processing_time"],
            "disclaimer": "⚠️ Automatisch generierte Zusammenfassung. Bitte überprüfen Sie die Genauigkeit."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@router.post("/diagnosis-support")
async def get_diagnosis_support(
    request: DiagnosisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered diagnosis support"""
    try:
        ai_service = AIService()
        
        result = await ai_service.provide_diagnosis_support(
            symptoms=request.symptoms,
            patient_history=request.patient_history,
            patient_id=request.patient_id
        )
        
        # Log the diagnosis support request
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="diagnosis_support",
            details={
                "symptoms": request.symptoms[:100] + "..." if len(request.symptoms) > 100 else request.symptoms,
                "patient_id": request.patient_id,
                "confidence": result["confidence"]
            }
        )
        
        return {
            "possible_diagnoses": result["diagnoses"],
            "recommended_tests": result["tests"],
            "treatment_suggestions": result["treatments"],
            "confidence": result["confidence"],
            "disclaimer": "🚨 WICHTIGER HINWEIS: Dies sind KI-generierte Vorschläge zur Unterstützung. Sie ersetzen NICHT die professionelle medizinische Diagnose und Behandlung. Konsultieren Sie immer Ihr medizinisches Fachwissen und führen Sie angemessene Untersuchungen durch.",
            "processing_time": result["processing_time"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnosis support failed: {str(e)}")

@router.get("/interactions/{session_id}")
async def get_ai_interactions(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get AI interactions for a session"""
    try:
        interactions = db.query(AIInteraction).filter(
            AIInteraction.session_id == session_id,
            AIInteraction.user_id == current_user["id"]
        ).order_by(AIInteraction.created_at.desc()).all()
        
        return {
            "interactions": [
                {
                    "id": interaction.id,
                    "query": interaction.query,
                    "response": interaction.response,
                    "model_used": interaction.model_used,
                    "processing_time": interaction.processing_time,
                    "confidence_level": interaction.confidence_level,
                    "created_at": interaction.created_at,
                    "interaction_type": interaction.interaction_type
                }
                for interaction in interactions
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve interactions: {str(e)}")

@router.delete("/interactions/{session_id}")
async def delete_ai_interactions(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete AI interactions for GDPR compliance"""
    try:
        # Delete interactions
        deleted_count = db.query(AIInteraction).filter(
            AIInteraction.session_id == session_id,
            AIInteraction.user_id == current_user["id"]
        ).delete()
        
        db.commit()
        
        # Log the deletion
        await AuditService().log_action(
            user_id=current_user["id"],
            action="ai_interactions_deleted",
            details={"session_id": session_id, "deleted_count": deleted_count}
        )
        
        return {"message": f"Deleted {deleted_count} AI interactions", "session_id": session_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete interactions: {str(e)}")
