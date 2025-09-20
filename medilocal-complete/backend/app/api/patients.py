from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.patient import Patient, PatientRecord
from app.services.anonymization_service import AnonymizationService
from app.services.audit_service import AuditService

router = APIRouter()

class PatientCreate(BaseModel):
    age_range: str
    gender: str
    medical_history_summary: Optional[str] = None
    language: str = "de"

class PatientUpdate(BaseModel):
    age_range: Optional[str] = None
    gender: Optional[str] = None
    medical_history_summary: Optional[str] = None
    processing_status: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    patient_id: str
    age_range: str
    gender: str
    medical_history_summary: Optional[str]
    is_anonymized: bool
    processing_status: str
    created_at: str
    updated_at: Optional[str]
    language: str

@router.get("/", response_model=List[PatientResponse])
async def get_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all patients"""
    try:
        patients = db.query(Patient).offset(skip).limit(limit).all()
        return [
            PatientResponse(
                id=patient.id,
                patient_id=patient.patient_id,
                age_range=patient.age_range,
                gender=patient.gender,
                medical_history_summary=patient.medical_history_summary,
                is_anonymized=patient.is_anonymized,
                processing_status=patient.processing_status,
                created_at=patient.created_at.isoformat(),
                updated_at=patient.updated_at.isoformat() if patient.updated_at else None,
                language=patient.language
            )
            for patient in patients
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve patients: {str(e)}")

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific patient"""
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return PatientResponse(
            id=patient.id,
            patient_id=patient.patient_id,
            age_range=patient.age_range,
            gender=patient.gender,
            medical_history_summary=patient.medical_history_summary,
            is_anonymized=patient.is_anonymized,
            processing_status=patient.processing_status,
            created_at=patient.created_at.isoformat(),
            updated_at=patient.updated_at.isoformat() if patient.updated_at else None,
            language=patient.language
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve patient: {str(e)}")

@router.post("/", response_model=PatientResponse)
async def create_patient(
    patient_data: PatientCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new patient"""
    try:
        # Generate anonymized patient ID
        import uuid
        patient_id = f"P-{uuid.uuid4().hex[:8].upper()}"
        
        patient = Patient(
            patient_id=patient_id,
            age_range=patient_data.age_range,
            gender=patient_data.gender,
            medical_history_summary=patient_data.medical_history_summary,
            language=patient_data.language,
            is_anonymized=True,
            processing_status="created"
        )
        
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
        # Log the creation
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="patient_created",
            details={"patient_id": patient_id, "age_range": patient_data.age_range}
        )
        
        return PatientResponse(
            id=patient.id,
            patient_id=patient.patient_id,
            age_range=patient.age_range,
            gender=patient.gender,
            medical_history_summary=patient.medical_history_summary,
            is_anonymized=patient.is_anonymized,
            processing_status=patient.processing_status,
            created_at=patient.created_at.isoformat(),
            updated_at=patient.updated_at.isoformat() if patient.updated_at else None,
            language=patient.language
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create patient: {str(e)}")

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a patient"""
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Update fields
        if patient_data.age_range is not None:
            patient.age_range = patient_data.age_range
        if patient_data.gender is not None:
            patient.gender = patient_data.gender
        if patient_data.medical_history_summary is not None:
            patient.medical_history_summary = patient_data.medical_history_summary
        if patient_data.processing_status is not None:
            patient.processing_status = patient_data.processing_status
        
        db.commit()
        db.refresh(patient)
        
        # Log the update
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="patient_updated",
            details={"patient_id": patient_id}
        )
        
        return PatientResponse(
            id=patient.id,
            patient_id=patient.patient_id,
            age_range=patient.age_range,
            gender=patient.gender,
            medical_history_summary=patient.medical_history_summary,
            is_anonymized=patient.is_anonymized,
            processing_status=patient.processing_status,
            created_at=patient.created_at.isoformat(),
            updated_at=patient.updated_at.isoformat() if patient.updated_at else None,
            language=patient.language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update patient: {str(e)}")

@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a patient (GDPR compliant)"""
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Delete related records
        db.query(PatientRecord).filter(PatientRecord.patient_id == patient_id).delete()
        
        # Delete patient
        db.delete(patient)
        db.commit()
        
        # Log the deletion
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="patient_deleted",
            details={"patient_id": patient_id, "gdpr_deletion": True}
        )
        
        return {"message": f"Patient {patient_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete patient: {str(e)}")

@router.get("/{patient_id}/records")
async def get_patient_records(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all records for a patient"""
    try:
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        records = db.query(PatientRecord).filter(
            PatientRecord.patient_id == patient_id,
            PatientRecord.is_deleted == False
        ).all()
        
        return {
            "patient_id": patient_id,
            "records": [
                {
                    "id": record.id,
                    "record_type": record.record_type,
                    "anonymized_content": record.anonymized_content,
                    "summary": record.summary,
                    "ai_insights": record.ai_insights,
                    "confidence_score": record.confidence_score,
                    "created_at": record.created_at.isoformat(),
                    "processed_at": record.processed_at.isoformat() if record.processed_at else None,
                    "consent_given": record.consent_given
                }
                for record in records
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve patient records: {str(e)}")
