import pytest
from app.services.anonymization_service import AnonymizationService
from app.utils.gdpr_compliance import GDPRCompliance

@pytest.fixture
def anonymization_service():
    return AnonymizationService()

def test_local_anonymization(anonymization_service):
    """Test local anonymization functionality"""
    test_text = """
    Patient: Max Mustermann
    Adresse: Musterstraße 123, 12345 Berlin
    Telefon: +49 30 12345678
    E-Mail: max.mustermann@example.com
    Geburtsdatum: 15.03.1980
    Versicherungsnummer: A123456789
    
    Konsultation vom 15.12.2023:
    Patient klagt über Kopfschmerzen und Müdigkeit.
    """
    
    result = anonymization_service._anonymize_locally(test_text)
    
    assert result['gdpr_compliant'] is True
    assert result['replacement_count'] > 0
    assert 'Max Mustermann' not in result['anonymized_text']
    assert 'Musterstraße 123' not in result['anonymized_text']
    assert '+49 30 12345678' not in result['anonymized_text']
    assert 'max.mustermann@example.com' not in result['anonymized_text']
    
    # Check that replacements were made
    assert '[NAME_' in result['anonymized_text']
    assert '[ADRESSE_' in result['anonymized_text']
    assert '[TELEFON_' in result['anonymized_text']
    assert '[EMAIL_' in result['anonymized_text']

def test_anonymization_validation(anonymization_service):
    """Test anonymization validation"""
    # Test with non-anonymized text
    original_text = "Patient Max Mustermann, wohnhaft in der Hauptstraße 45, 10115 Berlin"
    anonymized_text = "Patient [NAME_1], wohnhaft in [ADRESSE_1]"
    
    validation = anonymization_service.validate_anonymization(original_text, anonymized_text)
    
    assert validation['is_valid'] is True
    assert validation['anonymization_score'] > 80

def test_anonymization_hash(anonymization_service):
    """Test anonymization hash generation"""
    text = "Test medical text for hashing"
    hash1 = anonymization_service.create_anonymization_hash(text)
    hash2 = anonymization_service.create_anonymization_hash(text)
    
    assert hash1 == hash2
    assert len(hash1) == 64  # SHA256 hex length

def test_gdpr_validation():
    """Test GDPR compliance validation"""
    # Test with sensitive data
    sensitive_text = "Patient Max Mustermann, Tel: 030-12345678, max@example.com"
    validation = GDPRCompliance.validate_anonymization(sensitive_text)
    
    assert validation['is_anonymized'] is False
    assert len(validation['issues']) > 0
    assert validation['confidence_score'] < 100
    
    # Test with anonymized data
    anonymized_text = "Patient [NAME_1], Tel: [TELEFON_1], [EMAIL_1]"
    validation = GDPRCompliance.validate_anonymization(anonymized_text)
    
    assert validation['is_anonymized'] is True
    assert len(validation['issues']) == 0
    assert validation['confidence_score'] == 100

def test_consent_record_generation():
    """Test GDPR consent record generation"""
    consent = GDPRCompliance.generate_consent_record(
        patient_id="P-12345678",
        consent_type="medical_ai_processing",
        consent_given=True,
        purpose="AI-assisted medical diagnosis support"
    )
    
    assert consent['patient_id'] == "P-12345678"
    assert consent['consent_given'] is True
    assert consent['legal_basis'] == "Article 6(1)(a) - Consent"
    assert 'consent_id' in consent
    assert 'timestamp' in consent

def test_data_processing_record():
    """Test data processing record creation"""
    record = GDPRCompliance.create_data_processing_record(
        activity="medical_diagnosis_support",
        patient_id="P-12345678",
        data_types=["symptoms", "medical_history"],
        purpose="AI-assisted diagnosis",
        legal_basis="Article 9(2)(h) - Healthcare provision"
    )
    
    assert record['activity'] == "medical_diagnosis_support"
    assert record['patient_id'] == "P-12345678"
    assert "symptoms" in record['data_types']
    assert record['data_location'] == "Local device - no cloud processing"
    assert 'record_id' in record

def test_data_subject_rights_validation():
    """Test data subject rights request validation"""
    # Valid request
    valid_request = GDPRCompliance.validate_data_subject_rights(
        request_type="erasure",
        patient_id="P-12345678"
    )
    
    assert valid_request['valid'] is True
    assert valid_request['legal_basis'] == "Article 17 - Right to erasure"
    assert 'request_id' in valid_request
    assert 'response_deadline' in valid_request
    
    # Invalid request
    invalid_request = GDPRCompliance.validate_data_subject_rights(
        request_type="invalid_type",
        patient_id="P-12345678"
    )
    
    assert invalid_request['valid'] is False
    assert 'error' in invalid_request

def test_privacy_impact_assessment():
    """Test privacy impact assessment"""
    # High-risk scenario
    high_risk = GDPRCompliance.assess_privacy_impact(
        processing_activity="automated_decision_making",
        data_sensitivity="special_category",
        data_volume="large_scale",
        automated_decisions=True
    )
    
    assert high_risk['dpia_required'] is True
    assert high_risk['risk_level'] == "high"
    assert len(high_risk['risk_factors']) > 0
    
    # Low-risk scenario
    low_risk = GDPRCompliance.assess_privacy_impact(
        processing_activity="basic_processing",
        data_sensitivity="normal",
        data_volume="small_scale",
        automated_decisions=False
    )
    
    assert low_risk['dpia_required'] is False
    assert low_risk['risk_level'] == "low"

def test_retention_date_calculation():
    """Test data retention date calculation"""
    from datetime import datetime, timedelta
    
    # Test medical records retention
    retention_date = GDPRCompliance.calculate_retention_date('medical_records')
    expected_date = datetime.utcnow() + timedelta(days=2555)  # 7 years
    
    # Allow for small time differences in test execution
    assert abs((retention_date - expected_date).total_seconds()) < 60
    
    # Test audit logs retention
    retention_date = GDPRCompliance.calculate_retention_date('audit_logs')
    expected_date = datetime.utcnow() + timedelta(days=2190)  # 6 years
    
    assert abs((retention_date - expected_date).total_seconds()) < 60

def test_privacy_notice_generation():
    """Test privacy notice generation"""
    notice = GDPRCompliance.generate_privacy_notice()
    
    assert 'data_controller' in notice
    assert 'data_processing' in notice
    assert 'data_retention' in notice
    assert 'data_subject_rights' in notice
    assert 'data_security' in notice
    assert 'automated_decision_making' in notice
    
    # Check specific content
    assert 'Medical diagnosis support' in notice['data_processing']['purposes']
    assert 'Local processing only - no cloud storage' in notice['data_security']
    assert notice['data_transfers'] == 'No international data transfers - all processing is local'
