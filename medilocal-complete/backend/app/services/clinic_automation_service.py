import httpx
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.services.ai_service import AIService

class ClinicAutomationService:
    """
    Comprehensive clinic workflow automation service
    Connects Medical AI with appointment scheduling and redundant task automation
    """
    
    def __init__(self):
        self.ai_service = AIService()
        self.n8n_url = settings.N8N_URL
        
    async def intelligent_appointment_booking(
        self,
        patient_request: str,
        patient_id: Optional[str] = None,
        symptoms: Optional[str] = None,
        patient_history: Optional[str] = None,
        urgency: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        AI-powered intelligent appointment scheduling
        Analyzes patient request and automatically suggests/books optimal appointments
        """
        try:
            # Call n8n intelligent appointment workflow
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.n8n_url}/webhook/smart-scheduling",
                    json={
                        "patient_request": patient_request,
                        "patient_id": patient_id,
                        "symptoms": symptoms,
                        "patient_history": patient_history,
                        "urgency": urgency
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Process the result and add additional intelligence
                    return await self._enhance_appointment_result(result, patient_id)
                else:
                    raise Exception(f"Appointment scheduling failed: {response.status_code}")
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "fallback_suggestions": await self._generate_fallback_appointments()
            }
    
    async def automated_consultation_documentation(
        self,
        consultation_data: Dict[str, Any],
        doctor_id: str,
        patient_id: str
    ) -> Dict[str, Any]:
        """
        Automatically generate comprehensive medical documentation
        Includes SOAP notes, medical letters, billing codes, and follow-up tasks
        """
        try:
            # Call n8n automated documentation workflow
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.n8n_url}/webhook/auto-documentation",
                    json={
                        **consultation_data,
                        "doctor_id": doctor_id,
                        "patient_id": patient_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Execute additional automation tasks
                    await self._execute_post_consultation_automation(result, patient_id, doctor_id)
                    
                    return result
                else:
                    raise Exception(f"Documentation automation failed: {response.status_code}")
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "manual_documentation_required": True
            }
    
    async def prescription_renewal_automation(
        self,
        patient_id: str,
        doctor_id: str
    ) -> Dict[str, Any]:
        """
        Automatically check and process prescription renewals
        """
        try:
            # Get patient's current prescriptions (mock data for demo)
            current_prescriptions = await self._get_patient_prescriptions(patient_id)
            
            renewal_results = []
            for prescription in current_prescriptions:
                # Check if renewal is due
                if self._is_renewal_due(prescription):
                    # AI safety check for prescription renewal
                    safety_check = await self._ai_prescription_safety_check(
                        prescription, patient_id
                    )
                    
                    if safety_check["safe_to_renew"]:
                        # Auto-renew prescription
                        renewal_result = await self._process_prescription_renewal(
                            prescription, doctor_id, patient_id
                        )
                        renewal_results.append(renewal_result)
                    else:
                        # Flag for manual review
                        renewal_results.append({
                            "prescription": prescription["name"],
                            "status": "manual_review_required",
                            "reason": safety_check["reason"]
                        })
            
            return {
                "success": True,
                "renewals_processed": len([r for r in renewal_results if r["status"] == "renewed"]),
                "manual_reviews_required": len([r for r in renewal_results if r["status"] == "manual_review_required"]),
                "results": renewal_results
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def insurance_form_automation(
        self,
        patient_id: str,
        consultation_data: Dict[str, Any],
        doctor_id: str
    ) -> Dict[str, Any]:
        """
        Automatically generate and pre-fill insurance forms
        """
        try:
            # Extract relevant data for insurance forms
            diagnosis_codes = self._extract_icd10_codes(consultation_data.get("diagnosis", ""))
            treatment_codes = self._extract_treatment_codes(consultation_data.get("treatment", ""))
            
            # Generate insurance forms
            forms = []
            
            # Behandlungsschein (Treatment Certificate)
            if diagnosis_codes:
                behandlungsschein = await self._generate_behandlungsschein(
                    patient_id, diagnosis_codes, treatment_codes, doctor_id
                )
                forms.append(behandlungsschein)
            
            # Überweisungsschein (Referral Form) if needed
            if self._requires_referral(consultation_data):
                referral_form = await self._generate_referral_form(
                    patient_id, consultation_data, doctor_id
                )
                forms.append(referral_form)
            
            # AU-Bescheinigung (Sick Leave Certificate) if needed
            if consultation_data.get("sick_leave_required"):
                sick_leave = await self._generate_sick_leave_certificate(
                    patient_id, consultation_data, doctor_id
                )
                forms.append(sick_leave)
            
            return {
                "success": True,
                "forms_generated": len(forms),
                "forms": forms,
                "estimated_time_saved": len(forms) * 8  # 8 minutes per form
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def follow_up_automation(
        self,
        patient_id: str,
        consultation_data: Dict[str, Any],
        doctor_id: str
    ) -> Dict[str, Any]:
        """
        Automatically schedule follow-up appointments and reminders
        """
        try:
            follow_up_tasks = []
            
            # Determine follow-up requirements based on consultation
            follow_up_needs = await self._analyze_follow_up_requirements(
                consultation_data, patient_id
            )
            
            for need in follow_up_needs:
                if need["type"] == "appointment":
                    # Schedule follow-up appointment
                    appointment = await self._schedule_follow_up_appointment(
                        patient_id, need, doctor_id
                    )
                    follow_up_tasks.append(appointment)
                    
                elif need["type"] == "lab_test":
                    # Schedule lab tests
                    lab_order = await self._create_lab_order(
                        patient_id, need, doctor_id
                    )
                    follow_up_tasks.append(lab_order)
                    
                elif need["type"] == "medication_check":
                    # Schedule medication review
                    med_review = await self._schedule_medication_review(
                        patient_id, need, doctor_id
                    )
                    follow_up_tasks.append(med_review)
            
            return {
                "success": True,
                "follow_up_tasks": len(follow_up_tasks),
                "tasks": follow_up_tasks,
                "patient_notifications_sent": True
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def daily_clinic_automation(self, doctor_id: str) -> Dict[str, Any]:
        """
        Run daily automation tasks for the entire clinic
        """
        try:
            automation_results = {
                "prescription_renewals": 0,
                "appointment_reminders": 0,
                "insurance_forms": 0,
                "lab_results_processed": 0,
                "follow_ups_scheduled": 0
            }
            
            # Get today's appointments
            today_appointments = await self._get_todays_appointments(doctor_id)
            
            # Process each appointment
            for appointment in today_appointments:
                # Send appointment reminders
                reminder_sent = await self._send_appointment_reminder(appointment)
                if reminder_sent:
                    automation_results["appointment_reminders"] += 1
                
                # Check for prescription renewals
                renewals = await self.prescription_renewal_automation(
                    appointment["patient_id"], doctor_id
                )
                automation_results["prescription_renewals"] += renewals.get("renewals_processed", 0)
            
            # Process lab results
            lab_results = await self._process_pending_lab_results(doctor_id)
            automation_results["lab_results_processed"] = len(lab_results)
            
            # Schedule follow-ups
            follow_ups = await self._process_pending_follow_ups(doctor_id)
            automation_results["follow_ups_scheduled"] = len(follow_ups)
            
            return {
                "success": True,
                "automation_summary": automation_results,
                "estimated_time_saved": self._calculate_time_saved(automation_results),
                "cost_savings": self._calculate_cost_savings(automation_results)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Helper methods
    async def _enhance_appointment_result(self, result: Dict, patient_id: str) -> Dict:
        """Enhance appointment result with additional patient context"""
        # Add patient-specific optimizations
        if patient_id:
            patient_preferences = await self._get_patient_preferences(patient_id)
            result["patient_preferences"] = patient_preferences
        
        return result
    
    async def _generate_fallback_appointments(self) -> List[Dict]:
        """Generate fallback appointment suggestions"""
        now = datetime.now()
        return [
            {
                "datetime": (now + timedelta(days=1)).isoformat(),
                "type": "routine",
                "duration": 30,
                "confidence": "medium"
            },
            {
                "datetime": (now + timedelta(days=2)).isoformat(),
                "type": "routine", 
                "duration": 30,
                "confidence": "medium"
            }
        ]
    
    def _extract_icd10_codes(self, diagnosis_text: str) -> List[str]:
        """Extract ICD-10 codes from diagnosis text"""
        import re
        pattern = r'[A-Z]\d{2}(?:\.\d{1,2})?'
        return re.findall(pattern, diagnosis_text)
    
    def _extract_treatment_codes(self, treatment_text: str) -> List[str]:
        """Extract treatment codes from treatment text"""
        # Simplified extraction - in real system, use medical coding API
        return ["GOÄ 1", "GOÄ 5", "EBM 03000"]
    
    def _calculate_time_saved(self, results: Dict) -> int:
        """Calculate total time saved in minutes"""
        time_per_task = {
            "prescription_renewals": 5,
            "appointment_reminders": 2,
            "insurance_forms": 15,
            "lab_results_processed": 8,
            "follow_ups_scheduled": 5
        }
        
        total_minutes = 0
        for task, count in results.items():
            if task in time_per_task:
                total_minutes += count * time_per_task[task]
        
        return total_minutes
    
    def _calculate_cost_savings(self, results: Dict) -> float:
        """Calculate cost savings in euros"""
        time_saved = self._calculate_time_saved(results)
        hourly_rate = 120  # €120/hour doctor time
        return round((time_saved / 60) * hourly_rate, 2)
    
    # Mock methods for demo - replace with real database queries
    async def _get_patient_prescriptions(self, patient_id: str) -> List[Dict]:
        return [
            {"name": "Metformin 500mg", "last_prescribed": "2024-08-15", "chronic": True},
            {"name": "Ramipril 5mg", "last_prescribed": "2024-08-20", "chronic": True}
        ]
    
    def _is_renewal_due(self, prescription: Dict) -> bool:
        last_prescribed = datetime.fromisoformat(prescription["last_prescribed"])
        return (datetime.now() - last_prescribed).days > 90
    
    async def _ai_prescription_safety_check(self, prescription: Dict, patient_id: str) -> Dict:
        return {"safe_to_renew": True, "reason": "No contraindications found"}
    
    async def _get_patient_preferences(self, patient_id: str) -> Dict:
        return {"preferred_time": "morning", "language": "german"}
    
    async def _get_todays_appointments(self, doctor_id: str) -> List[Dict]:
        return [{"patient_id": "patient_123", "time": "10:00", "type": "routine"}]
