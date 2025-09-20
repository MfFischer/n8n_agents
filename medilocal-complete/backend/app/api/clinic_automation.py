from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.audit_service import AuditService
from app.services.clinic_automation_service import ClinicAutomationService

router = APIRouter()

class ConsultationDocumentationRequest(BaseModel):
    patient_id: str
    consultation_notes: Optional[str] = None
    vital_signs: Optional[Dict[str, Any]] = None
    symptoms: Optional[str] = None
    examination_findings: Optional[str] = None
    consultation_type: Optional[str] = "routine"
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None

class PrescriptionRenewalRequest(BaseModel):
    patient_id: str
    check_all_prescriptions: bool = True

class InsuranceFormRequest(BaseModel):
    patient_id: str
    consultation_data: Dict[str, Any]
    form_types: Optional[List[str]] = ["behandlungsschein"]

@router.post("/documentation/auto-generate")
async def auto_generate_documentation(
    request: ConsultationDocumentationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Automatically generate comprehensive medical documentation"""
    try:
        automation_service = ClinicAutomationService()
        
        consultation_data = {
            "consultation_notes": request.consultation_notes,
            "vital_signs": request.vital_signs,
            "symptoms": request.symptoms,
            "examination_findings": request.examination_findings,
            "consultation_type": request.consultation_type,
            "diagnosis": request.diagnosis,
            "treatment": request.treatment
        }
        
        result = await automation_service.automated_consultation_documentation(
            consultation_data=consultation_data,
            doctor_id=current_user["id"],
            patient_id=request.patient_id
        )
        
        # Log the documentation automation
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="automated_documentation",
            details={
                "patient_id": request.patient_id,
                "consultation_type": request.consultation_type,
                "time_saved": result.get("time_saved_minutes", 0),
                "automation_success": result.get("success", False)
            }
        )
        
        return {
            "success": result.get("success", False),
            "documentation": result.get("documentation", {}),
            "automation_results": result.get("automation_results", {}),
            "time_saved": f"{result.get('time_saved_minutes', 0)} minutes",
            "cost_savings": f"€{result.get('cost_efficiency', 0)}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Documentation automation failed: {str(e)}")

@router.post("/prescriptions/auto-renew")
async def auto_renew_prescriptions(
    request: PrescriptionRenewalRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Automatically process prescription renewals with AI safety checks"""
    try:
        automation_service = ClinicAutomationService()
        
        result = await automation_service.prescription_renewal_automation(
            patient_id=request.patient_id,
            doctor_id=current_user["id"]
        )
        
        # Log prescription renewals
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="prescription_auto_renewal",
            details={
                "patient_id": request.patient_id,
                "renewals_processed": result.get("renewals_processed", 0),
                "manual_reviews": result.get("manual_reviews_required", 0)
            }
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prescription renewal failed: {str(e)}")

@router.post("/insurance/auto-forms")
async def auto_generate_insurance_forms(
    request: InsuranceFormRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Automatically generate and pre-fill insurance forms"""
    try:
        automation_service = ClinicAutomationService()
        
        result = await automation_service.insurance_form_automation(
            patient_id=request.patient_id,
            consultation_data=request.consultation_data,
            doctor_id=current_user["id"]
        )
        
        # Log insurance form generation
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="insurance_form_automation",
            details={
                "patient_id": request.patient_id,
                "forms_generated": result.get("forms_generated", 0),
                "time_saved": result.get("estimated_time_saved", 0)
            }
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insurance form automation failed: {str(e)}")

@router.post("/follow-up/auto-schedule")
async def auto_schedule_follow_up(
    patient_id: str,
    consultation_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Automatically schedule follow-up appointments and tasks"""
    try:
        automation_service = ClinicAutomationService()
        
        result = await automation_service.follow_up_automation(
            patient_id=patient_id,
            consultation_data=consultation_data,
            doctor_id=current_user["id"]
        )
        
        # Log follow-up automation
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="follow_up_automation",
            details={
                "patient_id": patient_id,
                "follow_up_tasks": result.get("follow_up_tasks", 0)
            }
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Follow-up automation failed: {str(e)}")

@router.get("/daily-automation")
async def run_daily_automation(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Run daily clinic automation tasks"""
    try:
        automation_service = ClinicAutomationService()
        
        result = await automation_service.daily_clinic_automation(
            doctor_id=current_user["id"]
        )
        
        # Log daily automation
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="daily_automation",
            details={
                "automation_summary": result.get("automation_summary", {}),
                "time_saved": result.get("estimated_time_saved", 0),
                "cost_savings": result.get("cost_savings", 0)
            }
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily automation failed: {str(e)}")

@router.get("/automation-stats")
async def get_automation_statistics(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get clinic automation statistics and ROI metrics"""
    try:
        # In real system, query audit logs and calculate metrics
        # For demo, return mock statistics
        
        stats = {
            "time_period_days": days,
            "total_automations": 156,
            "time_saved_hours": 42.5,
            "cost_savings_euro": 5100.0,
            "automation_breakdown": {
                "prescription_renewals": 45,
                "documentation_generation": 38,
                "insurance_forms": 28,
                "appointment_scheduling": 32,
                "follow_up_tasks": 13
            },
            "efficiency_metrics": {
                "average_time_per_consultation": "12 minutes (reduced from 18)",
                "documentation_accuracy": "94%",
                "patient_satisfaction": "4.7/5",
                "doctor_satisfaction": "4.5/5"
            },
            "roi_analysis": {
                "monthly_savings": 5100.0,
                "annual_projection": 61200.0,
                "payback_period_months": 2.3,
                "efficiency_improvement": "35%"
            }
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get automation stats: {str(e)}")

@router.post("/workflow/optimize")
async def optimize_clinic_workflow(
    workflow_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """AI-powered clinic workflow optimization suggestions"""
    try:
        automation_service = ClinicAutomationService()
        
        # Analyze current workflow and suggest optimizations
        optimization_prompt = f"""
        Analysiere den folgenden Klinikworkflow und schlage Optimierungen vor:
        
        Workflow-Daten: {workflow_data}
        
        Identifiziere:
        1. Zeitverschwendende Aktivitäten
        2. Automatisierungsmöglichkeiten
        3. Effizienzsteigerungen
        4. Kosteneinsparungen
        
        Gib konkrete, umsetzbare Empfehlungen.
        """
        
        ai_result = await automation_service.ai_service.chat_with_ai(
            message=optimization_prompt,
            context_type="workflow_optimization"
        )
        
        # Log workflow optimization
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="workflow_optimization",
            details={
                "workflow_analyzed": True,
                "optimization_suggestions": len(ai_result.get("response", "").split("\n"))
            }
        )
        
        return {
            "success": True,
            "optimization_suggestions": ai_result.get("response", ""),
            "confidence": ai_result.get("confidence", "medium"),
            "estimated_improvements": {
                "time_savings": "15-25%",
                "cost_reduction": "€800-1200/month",
                "patient_throughput": "+20%"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow optimization failed: {str(e)}")
