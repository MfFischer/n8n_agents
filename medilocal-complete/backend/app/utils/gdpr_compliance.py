"""
GDPR Compliance Utilities for MediLocal AI
Implements data protection and privacy requirements
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import hashlib
import json
import re

class GDPRCompliance:
    """GDPR compliance utilities and validators"""
    
    # Data retention periods (in days)
    RETENTION_PERIODS = {
        'medical_records': 2555,  # 7 years (German medical record retention)
        'audit_logs': 2190,       # 6 years (GDPR audit log retention)
        'ai_interactions': 1095,  # 3 years (AI interaction logs)
        'consent_records': 2555,  # 7 years (consent documentation)
        'anonymized_data': 3650   # 10 years (anonymized research data)
    }
    
    # Sensitive data patterns for detection
    SENSITIVE_PATTERNS = {
        'german_names': r'\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b',
        'addresses': r'\b\d{1,5}\s+[A-ZÄÖÜ][a-zäöüß\s]+(?:straße|str\.|platz|weg|allee|gasse)\b',
        'phone_numbers': r'\b(?:\+49|0)\s?\d{2,5}[\s\-]?\d{3,8}\b',
        'email_addresses': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'german_ids': r'\b\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-Z]\s?\d{3}\b',
        'insurance_numbers': r'\b[A-Z]\d{9}\b',
        'dates': r'\b\d{1,2}\.\d{1,2}\.\d{4}\b'
    }
    
    @classmethod
    def validate_anonymization(cls, text: str) -> Dict:
        """Validate that text is properly anonymized"""
        issues = []
        confidence_score = 100
        
        for pattern_name, pattern in cls.SENSITIVE_PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                issues.append({
                    'type': pattern_name,
                    'matches': matches,
                    'severity': 'high' if pattern_name in ['german_names', 'addresses', 'phone_numbers'] else 'medium'
                })
                confidence_score -= len(matches) * 15
        
        return {
            'is_anonymized': len(issues) == 0,
            'confidence_score': max(0, confidence_score),
            'issues': issues,
            'validation_timestamp': datetime.utcnow().isoformat()
        }
    
    @classmethod
    def calculate_retention_date(cls, data_type: str, created_date: datetime = None) -> datetime:
        """Calculate data retention expiry date"""
        if created_date is None:
            created_date = datetime.utcnow()
        
        retention_days = cls.RETENTION_PERIODS.get(data_type, 2555)  # Default 7 years
        return created_date + timedelta(days=retention_days)
    
    @classmethod
    def generate_consent_record(cls, patient_id: str, consent_type: str, consent_given: bool, 
                              purpose: str, legal_basis: str = "Article 6(1)(a) - Consent") -> Dict:
        """Generate GDPR-compliant consent record"""
        return {
            'patient_id': patient_id,
            'consent_type': consent_type,
            'consent_given': consent_given,
            'purpose': purpose,
            'legal_basis': legal_basis,
            'timestamp': datetime.utcnow().isoformat(),
            'consent_id': hashlib.sha256(f"{patient_id}-{consent_type}-{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16],
            'withdrawal_method': 'Contact clinic administration or use patient portal',
            'data_controller': 'MediLocal AI System',
            'retention_period': cls.RETENTION_PERIODS.get('consent_records', 2555)
        }
    
    @classmethod
    def create_data_processing_record(cls, activity: str, patient_id: str, data_types: List[str], 
                                    purpose: str, legal_basis: str) -> Dict:
        """Create Article 30 data processing record"""
        return {
            'record_id': hashlib.sha256(f"{activity}-{patient_id}-{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16],
            'activity': activity,
            'patient_id': patient_id,
            'data_types': data_types,
            'purpose': purpose,
            'legal_basis': legal_basis,
            'data_controller': 'Medical Practice using MediLocal AI',
            'data_processor': 'MediLocal AI System (Local Processing)',
            'data_location': 'Local device - no cloud processing',
            'retention_period': cls.calculate_retention_date('medical_records').isoformat(),
            'security_measures': [
                'Local processing only',
                'Automatic anonymization',
                'Encrypted data storage',
                'Access logging',
                'Regular security updates'
            ],
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @classmethod
    def validate_data_subject_rights(cls, request_type: str, patient_id: str) -> Dict:
        """Validate data subject rights requests"""
        valid_requests = {
            'access': 'Article 15 - Right of access',
            'rectification': 'Article 16 - Right to rectification',
            'erasure': 'Article 17 - Right to erasure',
            'restrict_processing': 'Article 18 - Right to restriction of processing',
            'data_portability': 'Article 20 - Right to data portability',
            'object': 'Article 21 - Right to object',
            'withdraw_consent': 'Article 7(3) - Right to withdraw consent'
        }
        
        if request_type not in valid_requests:
            return {
                'valid': False,
                'error': f'Invalid request type: {request_type}',
                'valid_types': list(valid_requests.keys())
            }
        
        return {
            'valid': True,
            'request_type': request_type,
            'legal_basis': valid_requests[request_type],
            'patient_id': patient_id,
            'request_id': hashlib.sha256(f"{request_type}-{patient_id}-{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16],
            'response_deadline': (datetime.utcnow() + timedelta(days=30)).isoformat(),  # 1 month response time
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @classmethod
    def generate_privacy_notice(cls) -> Dict:
        """Generate GDPR-compliant privacy notice"""
        return {
            'data_controller': {
                'name': 'Medical Practice using MediLocal AI',
                'contact': 'Contact your clinic administration',
                'dpo_contact': 'Data Protection Officer (if applicable)'
            },
            'data_processing': {
                'purposes': [
                    'Medical diagnosis support',
                    'Treatment recommendations',
                    'Medical record summarization',
                    'Appointment scheduling',
                    'Quality improvement'
                ],
                'legal_basis': [
                    'Article 6(1)(a) - Consent',
                    'Article 6(1)(c) - Legal obligation',
                    'Article 9(2)(h) - Healthcare provision'
                ],
                'data_types': [
                    'Medical symptoms (anonymized)',
                    'Treatment history (anonymized)',
                    'Age range and gender',
                    'Medical consultation notes (anonymized)'
                ]
            },
            'data_retention': {
                'medical_records': '7 years (German medical record law)',
                'ai_interactions': '3 years (quality assurance)',
                'audit_logs': '6 years (GDPR compliance)'
            },
            'data_subject_rights': [
                'Right of access (Article 15)',
                'Right to rectification (Article 16)',
                'Right to erasure (Article 17)',
                'Right to restriction (Article 18)',
                'Right to data portability (Article 20)',
                'Right to object (Article 21)',
                'Right to withdraw consent (Article 7)'
            ],
            'data_security': [
                'Local processing only - no cloud storage',
                'Automatic data anonymization',
                'Encrypted data storage',
                'Access control and logging',
                'Regular security updates'
            ],
            'data_transfers': 'No international data transfers - all processing is local',
            'automated_decision_making': {
                'exists': True,
                'description': 'AI-assisted medical diagnosis support',
                'safeguards': [
                    'Human oversight required',
                    'Professional medical judgment mandatory',
                    'Confidence levels provided',
                    'Medical disclaimers shown'
                ]
            },
            'last_updated': datetime.utcnow().isoformat()
        }
    
    @classmethod
    def assess_privacy_impact(cls, processing_activity: str, data_sensitivity: str, 
                            data_volume: str, automated_decisions: bool) -> Dict:
        """Assess if Data Protection Impact Assessment (DPIA) is required"""
        risk_score = 0
        risk_factors = []
        
        # High-risk processing activities
        if processing_activity in ['profiling', 'automated_decision_making', 'large_scale_processing']:
            risk_score += 30
            risk_factors.append(f'High-risk activity: {processing_activity}')
        
        # Sensitive data
        if data_sensitivity == 'special_category':
            risk_score += 25
            risk_factors.append('Special category data (health data)')
        
        # Data volume
        if data_volume == 'large_scale':
            risk_score += 20
            risk_factors.append('Large scale data processing')
        
        # Automated decisions
        if automated_decisions:
            risk_score += 25
            risk_factors.append('Automated decision making')
        
        dpia_required = risk_score >= 50
        
        return {
            'dpia_required': dpia_required,
            'risk_score': risk_score,
            'risk_level': 'high' if risk_score >= 70 else 'medium' if risk_score >= 40 else 'low',
            'risk_factors': risk_factors,
            'recommendation': 'Conduct DPIA before processing' if dpia_required else 'DPIA not required but recommended for documentation',
            'assessment_date': datetime.utcnow().isoformat()
        }
