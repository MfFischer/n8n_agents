import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from app.services.ai_service import AIService

@pytest.fixture
def ai_service():
    return AIService()

@pytest.mark.asyncio
async def test_process_chat_general(ai_service):
    """Test general chat processing"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "response": "Dies ist eine Testantwort für medizinische Beratung."
        }
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        result = await ai_service.process_chat(
            message="Was sind die Symptome einer Erkältung?",
            context_type="general",
            user_id="test_user"
        )
        
        assert "response" in result
        assert "confidence" in result
        assert "session_id" in result
        assert result["model_used"] == "llama3.2"

@pytest.mark.asyncio
async def test_summarize_medical_text(ai_service):
    """Test medical text summarization"""
    test_text = """
    Patient kam mit Beschwerden über Kopfschmerzen und Müdigkeit.
    Untersuchung ergab normale Vitalwerte. Empfehlung: Ruhe und Flüssigkeitszufuhr.
    """
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "response": "Zusammenfassung: Patient mit Kopfschmerzen und Müdigkeit. Normale Vitalwerte. Behandlung: Ruhe und Flüssigkeit."
        }
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        result = await ai_service.summarize_medical_text(
            text=test_text,
            summary_type="consultation"
        )
        
        assert "summary" in result
        assert "key_points" in result
        assert "confidence" in result

@pytest.mark.asyncio
async def test_diagnosis_support(ai_service):
    """Test diagnosis support functionality"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "response": """
            Mögliche Diagnosen:
            1. Erkältung (wahrscheinlich)
            2. Grippe (möglich)
            
            Empfohlene Tests:
            - Körpertemperatur messen
            - Rachenabstrich
            
            Behandlungsvorschläge:
            - Ruhe und Flüssigkeit
            - Symptomatische Behandlung
            """
        }
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        result = await ai_service.provide_diagnosis_support(
            symptoms="Fieber, Husten, Müdigkeit",
            patient_history="Keine bekannten Vorerkrankungen"
        )
        
        assert "diagnoses" in result
        assert "tests" in result
        assert "treatments" in result
        assert "confidence" in result

def test_assess_confidence(ai_service):
    """Test confidence assessment"""
    # High confidence text
    high_confidence_text = "Dies ist wahrscheinlich eine typische Erkältung mit charakteristischen Symptomen."
    confidence = ai_service._assess_confidence(high_confidence_text)
    assert confidence == "high"
    
    # Low confidence text
    low_confidence_text = "Dies könnte möglicherweise eine Erkältung sein, aber es ist unsicher."
    confidence = ai_service._assess_confidence(low_confidence_text)
    assert confidence == "low"
    
    # Medium confidence text
    medium_confidence_text = "Die Symptome deuten auf eine Erkältung hin."
    confidence = ai_service._assess_confidence(medium_confidence_text)
    assert confidence == "medium"

def test_build_system_prompt(ai_service):
    """Test system prompt building"""
    # Test general context
    prompt = ai_service._build_system_prompt("general")
    assert "MediLocal AI" in prompt
    assert "DSGVO" in prompt
    assert "professioneller medizinischer Beurteilung" in prompt
    
    # Test diagnosis context
    prompt = ai_service._build_system_prompt("diagnosis")
    assert "Diagnoseunterstützung" in prompt
    
    # Test treatment context
    prompt = ai_service._build_system_prompt("treatment")
    assert "Behandlungsvorschläge" in prompt

def test_parse_summary_response(ai_service):
    """Test summary response parsing"""
    response_text = """
    Zusammenfassung:
    Patient mit akuten Symptomen einer Atemwegserkrankung.
    
    Wichtige Punkte:
    • Fieber seit 2 Tagen
    • Trockener Husten
    • Müdigkeit und Abgeschlagenheit
    • Keine Atemnot
    """
    
    summary, key_points = ai_service._parse_summary_response(response_text)
    
    assert "Patient mit akuten Symptomen" in summary
    assert len(key_points) > 0
    assert any("Fieber seit 2 Tagen" in point for point in key_points)

def test_parse_diagnosis_response(ai_service):
    """Test diagnosis response parsing"""
    response_text = """
    Mögliche Diagnosen:
    1. Virale Atemwegsinfektion (wahrscheinlich)
    2. Bakterielle Infektion (möglich)
    
    Empfohlene Tests:
    • Blutbild
    • CRP-Wert
    • Rachenabstrich
    
    Behandlungsvorschläge:
    • Symptomatische Therapie
    • Ruhe und Flüssigkeitszufuhr
    • Bei Verschlechterung: Antibiotika erwägen
    """
    
    diagnoses, tests, treatments = ai_service._parse_diagnosis_response(response_text)
    
    assert len(diagnoses) > 0
    assert len(tests) > 0
    assert len(treatments) > 0
    assert any("Virale Atemwegsinfektion" in diag for diag in diagnoses)
    assert any("Blutbild" in test for test in tests)
    assert any("Symptomatische Therapie" in treatment for treatment in treatments)
