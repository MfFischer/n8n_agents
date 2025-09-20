from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.audit_service import AuditService
from app.models.patient import Patient, PatientRecord, AuditLog

router = APIRouter()

class DataDeletionRequest(BaseModel):
    patient_id: str
    reason: str = "GDPR Article 17 - Right to erasure"

class ConsentRequest(BaseModel):
    patient_id: str
    consent_type: str
    consent_given: bool

@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    gdpr_relevant: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get audit logs for compliance monitoring"""
    try:
        audit_service = AuditService()
        logs = audit_service.get_audit_logs(
            user_id=user_id,
            action=action,
            gdpr_relevant=gdpr_relevant,
            limit=limit
        )
        
        return {
            "audit_logs": logs,
            "total_count": len(logs),
            "filters_applied": {
                "user_id": user_id,
                "action": action,
                "gdpr_relevant": gdpr_relevant,
                "limit": limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve audit logs: {str(e)}")

@router.get("/gdpr-report/{patient_id}")
async def get_gdpr_report(
    patient_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate GDPR compliance report for a patient"""
    try:
        audit_service = AuditService()
        report = audit_service.get_gdpr_report(patient_id)
        
        if not report:
            raise HTTPException(status_code=404, detail="No data found for patient")
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate GDPR report: {str(e)}")

@router.post("/delete-data")
async def request_data_deletion(
    request: DataDeletionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Request deletion of patient data (GDPR Article 17)"""
    try:
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.patient_id == request.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Mark all records for deletion
        records = db.query(PatientRecord).filter(
            PatientRecord.patient_id == request.patient_id
        ).all()
        
        for record in records:
            record.is_deleted = True
            record.retention_until = datetime.utcnow()  # Immediate deletion
        
        # Delete patient
        db.delete(patient)
        db.commit()
        
        # Log the deletion
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="gdpr_data_deletion",
            details={
                "patient_id": request.patient_id,
                "reason": request.reason,
                "records_deleted": len(records)
            },
            gdpr_relevant=True,
            data_subject_id=request.patient_id
        )
        
        return {
            "message": f"Data deletion completed for patient {request.patient_id}",
            "records_deleted": len(records),
            "deletion_timestamp": datetime.utcnow().isoformat(),
            "gdpr_compliant": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete data: {str(e)}")

@router.get("/export-data/{patient_id}")
async def export_patient_data(
    patient_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Export patient data (GDPR Article 20 - Right to data portability)"""
    try:
        # Get patient data
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Get all records
        records = db.query(PatientRecord).filter(
            PatientRecord.patient_id == patient_id,
            PatientRecord.is_deleted == False
        ).all()
        
        # Prepare export data
        export_data = {
            "patient_information": {
                "patient_id": patient.patient_id,
                "age_range": patient.age_range,
                "gender": patient.gender,
                "medical_history_summary": patient.medical_history_summary,
                "created_at": patient.created_at.isoformat(),
                "language": patient.language
            },
            "medical_records": [
                {
                    "record_id": record.id,
                    "record_type": record.record_type,
                    "anonymized_content": record.anonymized_content,
                    "summary": record.summary,
                    "ai_insights": record.ai_insights,
                    "created_at": record.created_at.isoformat(),
                    "processed_at": record.processed_at.isoformat() if record.processed_at else None
                }
                for record in records
            ],
            "export_metadata": {
                "export_timestamp": datetime.utcnow().isoformat(),
                "exported_by": current_user["id"],
                "total_records": len(records),
                "gdpr_article": "Article 20 - Right to data portability",
                "data_format": "JSON"
            }
        }
        
        # Log the export
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="gdpr_data_export",
            details={
                "patient_id": patient_id,
                "records_exported": len(records)
            },
            gdpr_relevant=True,
            data_subject_id=patient_id
        )
        
        return export_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")

@router.post("/consent")
async def manage_consent(
    request: ConsentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Manage patient consent (GDPR Article 6 & 7)"""
    try:
        # Update consent for all patient records
        records = db.query(PatientRecord).filter(
            PatientRecord.patient_id == request.patient_id
        ).all()
        
        for record in records:
            record.consent_given = request.consent_given
        
        db.commit()
        
        # Log consent change
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="consent_updated",
            details={
                "patient_id": request.patient_id,
                "consent_type": request.consent_type,
                "consent_given": request.consent_given,
                "records_updated": len(records)
            },
            gdpr_relevant=True,
            data_subject_id=request.patient_id
        )
        
        return {
            "message": f"Consent updated for patient {request.patient_id}",
            "consent_given": request.consent_given,
            "consent_type": request.consent_type,
            "records_updated": len(records),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update consent: {str(e)}")

@router.get("/data-retention")
async def get_data_retention_status(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get data retention status overview"""
    try:
        # Get records approaching retention limit
        retention_limit = datetime.utcnow() + timedelta(days=30)  # 30 days warning
        
        expiring_records = db.query(PatientRecord).filter(
            PatientRecord.retention_until <= retention_limit,
            PatientRecord.is_deleted == False
        ).all()
        
        # Get total statistics
        total_patients = db.query(Patient).count()
        total_records = db.query(PatientRecord).filter(PatientRecord.is_deleted == False).count()
        deleted_records = db.query(PatientRecord).filter(PatientRecord.is_deleted == True).count()
        
        return {
            "retention_overview": {
                "total_patients": total_patients,
                "total_active_records": total_records,
                "deleted_records": deleted_records,
                "records_expiring_soon": len(expiring_records)
            },
            "expiring_records": [
                {
                    "patient_id": record.patient_id,
                    "record_type": record.record_type,
                    "retention_until": record.retention_until.isoformat() if record.retention_until else None,
                    "days_remaining": (record.retention_until - datetime.utcnow()).days if record.retention_until else None
                }
                for record in expiring_records
            ],
            "compliance_status": "GDPR-compliant",
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get retention status: {str(e)}")

@router.post("/cleanup-expired")
async def cleanup_expired_data(
    background_tasks: BackgroundTasks,
    retention_days: int = 2555,  # 7 years default
    current_user: dict = Depends(get_current_user)
):
    """Clean up expired data according to retention policy"""
    try:
        audit_service = AuditService()
        result = audit_service.cleanup_expired_data(retention_days)
        
        if result:
            # Log the cleanup
            background_tasks.add_task(
                AuditService().log_action,
                user_id=current_user["id"],
                action="data_cleanup",
                details=result,
                gdpr_relevant=True
            )
            
            return {
                "message": "Data cleanup completed successfully",
                "cleanup_results": result
            }
        else:
            raise HTTPException(status_code=500, detail="Data cleanup failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup data: {str(e)}")
