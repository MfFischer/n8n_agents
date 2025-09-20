from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.audit_service import AuditService

router = APIRouter()

# Simple in-memory appointment store for demo
# In production, use proper database
appointments_store = []

class AppointmentCreate(BaseModel):
    patient_id: str
    appointment_type: str
    scheduled_time: datetime
    duration_minutes: int = 30
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    scheduled_time: Optional[datetime] = None
    appointment_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    appointment_type: str
    scheduled_time: datetime
    duration_minutes: int
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    date: Optional[str] = None,
    patient_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get appointments with optional filters"""
    try:
        filtered_appointments = appointments_store.copy()
        
        # Apply filters
        if date:
            filter_date = datetime.fromisoformat(date).date()
            filtered_appointments = [
                apt for apt in filtered_appointments
                if apt["scheduled_time"].date() == filter_date
            ]
        
        if patient_id:
            filtered_appointments = [
                apt for apt in filtered_appointments
                if apt["patient_id"] == patient_id
            ]
        
        if status:
            filtered_appointments = [
                apt for apt in filtered_appointments
                if apt["status"] == status
            ]
        
        return [
            AppointmentResponse(
                id=apt["id"],
                patient_id=apt["patient_id"],
                appointment_type=apt["appointment_type"],
                scheduled_time=apt["scheduled_time"],
                duration_minutes=apt["duration_minutes"],
                status=apt["status"],
                notes=apt["notes"],
                created_at=apt["created_at"],
                updated_at=apt.get("updated_at")
            )
            for apt in filtered_appointments
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve appointments: {str(e)}")

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    appointment_data: AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create a new appointment"""
    try:
        import uuid
        appointment_id = str(uuid.uuid4())
        
        # Check for conflicts
        conflicts = [
            apt for apt in appointments_store
            if apt["scheduled_time"] <= appointment_data.scheduled_time < 
               apt["scheduled_time"] + timedelta(minutes=apt["duration_minutes"])
            or appointment_data.scheduled_time <= apt["scheduled_time"] < 
               appointment_data.scheduled_time + timedelta(minutes=appointment_data.duration_minutes)
        ]
        
        if conflicts:
            raise HTTPException(status_code=409, detail="Appointment time conflicts with existing appointment")
        
        appointment = {
            "id": appointment_id,
            "patient_id": appointment_data.patient_id,
            "appointment_type": appointment_data.appointment_type,
            "scheduled_time": appointment_data.scheduled_time,
            "duration_minutes": appointment_data.duration_minutes,
            "status": "scheduled",
            "notes": appointment_data.notes,
            "created_at": datetime.utcnow(),
            "updated_at": None
        }
        
        appointments_store.append(appointment)
        
        # Log the creation
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="appointment_created",
            details={
                "appointment_id": appointment_id,
                "patient_id": appointment_data.patient_id,
                "appointment_type": appointment_data.appointment_type,
                "scheduled_time": appointment_data.scheduled_time.isoformat()
            }
        )
        
        return AppointmentResponse(**appointment)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create appointment: {str(e)}")

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific appointment"""
    try:
        appointment = next((apt for apt in appointments_store if apt["id"] == appointment_id), None)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        return AppointmentResponse(**appointment)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve appointment: {str(e)}")

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    appointment_data: AppointmentUpdate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Update an appointment"""
    try:
        appointment = next((apt for apt in appointments_store if apt["id"] == appointment_id), None)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Update fields
        if appointment_data.scheduled_time is not None:
            appointment["scheduled_time"] = appointment_data.scheduled_time
        if appointment_data.appointment_type is not None:
            appointment["appointment_type"] = appointment_data.appointment_type
        if appointment_data.duration_minutes is not None:
            appointment["duration_minutes"] = appointment_data.duration_minutes
        if appointment_data.notes is not None:
            appointment["notes"] = appointment_data.notes
        if appointment_data.status is not None:
            appointment["status"] = appointment_data.status
        
        appointment["updated_at"] = datetime.utcnow()
        
        # Log the update
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="appointment_updated",
            details={
                "appointment_id": appointment_id,
                "changes": appointment_data.dict(exclude_unset=True)
            }
        )
        
        return AppointmentResponse(**appointment)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update appointment: {str(e)}")

@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Delete an appointment"""
    try:
        appointment_index = next(
            (i for i, apt in enumerate(appointments_store) if apt["id"] == appointment_id), 
            None
        )
        
        if appointment_index is None:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        deleted_appointment = appointments_store.pop(appointment_index)
        
        # Log the deletion
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="appointment_deleted",
            details={
                "appointment_id": appointment_id,
                "patient_id": deleted_appointment["patient_id"]
            }
        )
        
        return {"message": f"Appointment {appointment_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete appointment: {str(e)}")

@router.post("/intelligent-booking")
async def intelligent_appointment_booking(
    request: dict,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """AI-powered intelligent appointment booking"""
    try:
        from app.services.clinic_automation_service import ClinicAutomationService

        automation_service = ClinicAutomationService()

        result = await automation_service.intelligent_appointment_booking(
            patient_request=request.get("patient_request", ""),
            patient_id=request.get("patient_id"),
            symptoms=request.get("symptoms"),
            patient_history=request.get("patient_history"),
            urgency=request.get("urgency")
        )

        # Log the intelligent booking
        background_tasks.add_task(
            AuditService().log_action,
            user_id=current_user["id"],
            action="intelligent_appointment_booking",
            details={
                "patient_request": request.get("patient_request", "")[:100],
                "classification": result.get("classification", {}).get("classification"),
                "auto_booked": result.get("auto_booking_eligible", False)
            }
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intelligent booking failed: {str(e)}")

@router.get("/schedule/suggestions")
async def get_schedule_suggestions(
    date: str,
    duration_minutes: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get intelligent scheduling suggestions"""
    try:
        target_date = datetime.fromisoformat(date).date()

        # Get existing appointments for the day
        day_appointments = [
            apt for apt in appointments_store
            if apt["scheduled_time"].date() == target_date
        ]
        
        # Generate time slots (9 AM to 5 PM)
        start_time = datetime.combine(target_date, datetime.min.time().replace(hour=9))
        end_time = datetime.combine(target_date, datetime.min.time().replace(hour=17))
        
        suggestions = []
        current_time = start_time
        
        while current_time + timedelta(minutes=duration_minutes) <= end_time:
            # Check if slot is available
            slot_end = current_time + timedelta(minutes=duration_minutes)
            
            conflicts = [
                apt for apt in day_appointments
                if (current_time < apt["scheduled_time"] + timedelta(minutes=apt["duration_minutes"]) and
                    slot_end > apt["scheduled_time"])
            ]
            
            if not conflicts:
                suggestions.append({
                    "suggested_time": current_time.isoformat(),
                    "duration_minutes": duration_minutes,
                    "availability": "available",
                    "confidence": "high"
                })
            
            current_time += timedelta(minutes=30)  # 30-minute intervals
        
        return {
            "date": date,
            "suggestions": suggestions[:10],  # Limit to 10 suggestions
            "total_available_slots": len(suggestions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")
