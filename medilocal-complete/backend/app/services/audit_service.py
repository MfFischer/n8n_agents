from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Optional
import json

from app.core.database import SessionLocal
from app.models.patient import AuditLog, AIInteraction

class AuditService:
    def __init__(self):
        self.db = SessionLocal()
    
    async def log_action(
        self,
        user_id: str,
        action: str,
        details: Dict = None,
        resource_type: str = None,
        resource_id: str = None,
        gdpr_relevant: bool = False,
        data_subject_id: str = None,
        ip_address: str = None,
        user_agent: str = None
    ):
        """Log an action for audit purposes"""
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
                gdpr_relevant=gdpr_relevant,
                data_subject_id=data_subject_id,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            self.db.add(audit_log)
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            print(f"Failed to log audit action: {str(e)}")
        finally:
            self.db.close()
    
    async def log_ai_interaction(
        self,
        user_id: str,
        query: str,
        response: str,
        model_used: str,
        processing_time: int,
        patient_id: str = None,
        interaction_type: str = "general",
        session_id: str = None,
        confidence_level: str = "medium"
    ):
        """Log AI interaction for compliance and audit"""
        try:
            ai_interaction = AIInteraction(
                session_id=session_id,
                user_id=user_id,
                query=query,
                response=response,
                model_used=model_used,
                processing_time=processing_time,
                patient_id=patient_id,
                interaction_type=interaction_type,
                confidence_level=confidence_level,
                disclaimer_shown=True
            )
            
            self.db.add(ai_interaction)
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            print(f"Failed to log AI interaction: {str(e)}")
        finally:
            self.db.close()
    
    def get_audit_logs(
        self,
        user_id: str = None,
        action: str = None,
        gdpr_relevant: bool = None,
        start_date: datetime = None,
        end_date: datetime = None,
        limit: int = 100
    ):
        """Retrieve audit logs with filters"""
        try:
            query = self.db.query(AuditLog)
            
            if user_id:
                query = query.filter(AuditLog.user_id == user_id)
            if action:
                query = query.filter(AuditLog.action == action)
            if gdpr_relevant is not None:
                query = query.filter(AuditLog.gdpr_relevant == gdpr_relevant)
            if start_date:
                query = query.filter(AuditLog.timestamp >= start_date)
            if end_date:
                query = query.filter(AuditLog.timestamp <= end_date)
            
            logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
            
            return [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "details": log.details,
                    "gdpr_relevant": log.gdpr_relevant,
                    "data_subject_id": log.data_subject_id,
                    "timestamp": log.timestamp.isoformat()
                }
                for log in logs
            ]
            
        except Exception as e:
            print(f"Failed to retrieve audit logs: {str(e)}")
            return []
        finally:
            self.db.close()
    
    def get_gdpr_report(self, data_subject_id: str):
        """Generate GDPR compliance report for a data subject"""
        try:
            # Get all audit logs related to the data subject
            logs = self.db.query(AuditLog).filter(
                AuditLog.data_subject_id == data_subject_id,
                AuditLog.gdpr_relevant == True
            ).order_by(AuditLog.timestamp.desc()).all()
            
            # Get AI interactions
            ai_interactions = self.db.query(AIInteraction).filter(
                AIInteraction.patient_id == data_subject_id
            ).order_by(AIInteraction.created_at.desc()).all()
            
            report = {
                "data_subject_id": data_subject_id,
                "report_generated": datetime.utcnow().isoformat(),
                "audit_logs": [
                    {
                        "timestamp": log.timestamp.isoformat(),
                        "action": log.action,
                        "user_id": log.user_id,
                        "details": log.details
                    }
                    for log in logs
                ],
                "ai_interactions": [
                    {
                        "timestamp": interaction.created_at.isoformat(),
                        "interaction_type": interaction.interaction_type,
                        "model_used": interaction.model_used,
                        "processing_time": interaction.processing_time,
                        "confidence_level": interaction.confidence_level
                    }
                    for interaction in ai_interactions
                ],
                "summary": {
                    "total_audit_logs": len(logs),
                    "total_ai_interactions": len(ai_interactions),
                    "data_processing_activities": list(set([log.action for log in logs])),
                    "compliance_status": "GDPR-compliant"
                }
            }
            
            return report
            
        except Exception as e:
            print(f"Failed to generate GDPR report: {str(e)}")
            return None
        finally:
            self.db.close()
    
    def cleanup_expired_data(self, retention_days: int = 2555):  # 7 years default
        """Clean up expired audit data according to retention policy"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
            
            # Delete old audit logs
            deleted_logs = self.db.query(AuditLog).filter(
                AuditLog.timestamp < cutoff_date
            ).delete()
            
            # Delete old AI interactions
            deleted_interactions = self.db.query(AIInteraction).filter(
                AIInteraction.created_at < cutoff_date
            ).delete()
            
            self.db.commit()
            
            return {
                "deleted_audit_logs": deleted_logs,
                "deleted_ai_interactions": deleted_interactions,
                "cleanup_date": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.db.rollback()
            print(f"Failed to cleanup expired data: {str(e)}")
            return None
        finally:
            self.db.close()
