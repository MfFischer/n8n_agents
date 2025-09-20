import httpx
import json
import time
import uuid
from typing import Dict, List, Optional
from app.core.config import settings

class AIService:
    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL
        self.n8n_url = settings.N8N_URL
        self.default_model = settings.DEFAULT_LLM_MODEL
    
    async def process_chat(
        self, 
        message: str, 
        patient_id: Optional[str] = None,
        context_type: str = "general",
        user_id: str = None
    ) -> Dict:
        """Process chat message with AI"""
        start_time = time.time()
        session_id = str(uuid.uuid4())
        
        # Build context-aware prompt
        system_prompt = self._build_system_prompt(context_type)
        
        # Add patient context if available
        if patient_id:
            patient_context = await self._get_patient_context(patient_id)
            system_prompt += f"\n\nPatient Context: {patient_context}"
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.default_model,
                        "prompt": f"{system_prompt}\n\nUser: {message}\nAssistant:",
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "max_tokens": 1000
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    processing_time = int((time.time() - start_time) * 1000)
                    
                    return {
                        "response": result["response"],
                        "confidence": self._assess_confidence(result["response"]),
                        "processing_time": processing_time,
                        "model_used": self.default_model,
                        "session_id": session_id
                    }
                else:
                    raise Exception(f"Ollama API error: {response.status_code}")
                    
        except Exception as e:
            # Fallback to n8n workflow
            return await self._fallback_to_n8n(message, context_type, session_id)
    
    async def summarize_medical_text(
        self, 
        text: str, 
        summary_type: str = "consultation",
        patient_id: Optional[str] = None
    ) -> Dict:
        """Summarize medical text"""
        start_time = time.time()
        
        prompt = f"""Du bist ein medizinischer KI-Assistent für deutsche Kliniken. 
        Erstelle eine präzise Zusammenfassung des folgenden medizinischen Textes.
        
        Zusammenfassungstyp: {summary_type}
        
        Text: {text}
        
        Bitte erstelle:
        1. Eine kurze Zusammenfassung (2-3 Sätze)
        2. Wichtige Punkte als Aufzählung
        3. Relevante medizinische Begriffe
        
        Antworte auf Deutsch und verwende medizinische Fachterminologie."""
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.default_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.3}
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    processing_time = int((time.time() - start_time) * 1000)
                    
                    # Parse the response to extract summary and key points
                    response_text = result["response"]
                    summary, key_points = self._parse_summary_response(response_text)
                    
                    return {
                        "summary": summary,
                        "key_points": key_points,
                        "confidence": self._assess_confidence(response_text),
                        "processing_time": processing_time
                    }
                else:
                    raise Exception(f"Ollama API error: {response.status_code}")
                    
        except Exception as e:
            raise Exception(f"Summarization failed: {str(e)}")
    
    async def provide_diagnosis_support(
        self,
        symptoms: str,
        patient_history: Optional[str] = None,
        patient_id: Optional[str] = None
    ) -> Dict:
        """Provide AI-powered diagnosis support"""
        start_time = time.time()
        
        prompt = f"""Du bist ein medizinischer KI-Assistent für deutsche Ärzte. 
        Analysiere die folgenden Symptome und gib Diagnoseunterstützung.
        
        WICHTIG: Dies sind nur Vorschläge zur Unterstützung, keine endgültige Diagnose!
        
        Symptome: {symptoms}
        """
        
        if patient_history:
            prompt += f"\nPatientengeschichte: {patient_history}"
        
        prompt += """
        
        Bitte gib folgende Informationen:
        1. Mögliche Diagnosen (mit Wahrscheinlichkeit)
        2. Empfohlene Tests/Untersuchungen
        3. Behandlungsvorschläge
        4. Warnsignale, auf die zu achten ist
        
        Antworte strukturiert auf Deutsch."""
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.default_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.4}
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    processing_time = int((time.time() - start_time) * 1000)
                    
                    # Parse the structured response
                    response_text = result["response"]
                    diagnoses, tests, treatments = self._parse_diagnosis_response(response_text)
                    
                    return {
                        "diagnoses": diagnoses,
                        "tests": tests,
                        "treatments": treatments,
                        "confidence": self._assess_confidence(response_text),
                        "processing_time": processing_time
                    }
                else:
                    raise Exception(f"Ollama API error: {response.status_code}")
                    
        except Exception as e:
            raise Exception(f"Diagnosis support failed: {str(e)}")
    
    def _build_system_prompt(self, context_type: str) -> str:
        """Build context-aware system prompt"""
        base_prompt = """Du bist MediLocal AI, ein lokaler KI-Assistent für deutsche Kliniken und Ärzte.
        Du hilfst bei medizinischen Aufgaben unter strikter Einhaltung der DSGVO und des EU-KI-Gesetzes.
        
        WICHTIGE REGELN:
        - Alle Vorschläge sind nur zur Unterstützung, nicht als endgültige medizinische Entscheidung
        - Betone immer die Notwendigkeit professioneller medizinischer Beurteilung
        - Respektiere Patientendatenschutz und Vertraulichkeit
        - Antworte auf Deutsch, es sei denn, anders angefordert
        - Verwende medizinische Fachterminologie angemessen"""
        
        context_prompts = {
            "diagnosis": "\n\nSpezialisierung: Diagnoseunterstützung mit differentialdiagnostischen Überlegungen.",
            "treatment": "\n\nSpezialisierung: Behandlungsvorschläge basierend auf evidenzbasierter Medizin.",
            "summary": "\n\nSpezialisierung: Präzise Zusammenfassung medizinischer Dokumentation.",
            "general": "\n\nAllgemeine medizinische Beratung und Unterstützung."
        }
        
        return base_prompt + context_prompts.get(context_type, context_prompts["general"])
    
    async def _get_patient_context(self, patient_id: str) -> str:
        """Get patient context for AI processing"""
        # This would typically fetch anonymized patient data
        # For now, return a placeholder
        return f"Anonymized patient context for ID: {patient_id}"
    
    def _assess_confidence(self, response: str) -> str:
        """Assess confidence level of AI response"""
        # Simple heuristic - in production, use more sophisticated methods
        uncertainty_words = ["möglicherweise", "könnte", "eventuell", "unsicher", "unklar"]
        confidence_words = ["wahrscheinlich", "typisch", "charakteristisch", "eindeutig"]
        
        uncertainty_count = sum(1 for word in uncertainty_words if word in response.lower())
        confidence_count = sum(1 for word in confidence_words if word in response.lower())
        
        if confidence_count > uncertainty_count:
            return "high"
        elif uncertainty_count > confidence_count:
            return "low"
        else:
            return "medium"
    
    def _parse_summary_response(self, response: str) -> tuple:
        """Parse summary response into summary and key points"""
        lines = response.split('\n')
        summary = ""
        key_points = []
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if "zusammenfassung" in line.lower():
                current_section = "summary"
            elif "punkte" in line.lower() or "aufzählung" in line.lower():
                current_section = "points"
            elif line.startswith(('•', '-', '*', '1.', '2.', '3.')):
                if current_section == "points":
                    key_points.append(line.lstrip('•-*123. '))
            elif current_section == "summary" and len(line) > 20:
                summary += line + " "
        
        return summary.strip(), key_points
    
    def _parse_diagnosis_response(self, response: str) -> tuple:
        """Parse diagnosis response into structured data"""
        diagnoses = []
        tests = []
        treatments = []
        
        current_section = None
        for line in response.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if "diagnose" in line.lower():
                current_section = "diagnoses"
            elif "test" in line.lower() or "untersuchung" in line.lower():
                current_section = "tests"
            elif "behandlung" in line.lower():
                current_section = "treatments"
            elif line.startswith(('•', '-', '*', '1.', '2.', '3.')):
                clean_line = line.lstrip('•-*123. ')
                if current_section == "diagnoses":
                    diagnoses.append(clean_line)
                elif current_section == "tests":
                    tests.append(clean_line)
                elif current_section == "treatments":
                    treatments.append(clean_line)
        
        return diagnoses, tests, treatments
    
    async def _fallback_to_n8n(self, message: str, context_type: str, session_id: str) -> Dict:
        """Fallback to n8n workflow if Ollama fails"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.n8n_url}/webhook/ai-chat",
                    json={
                        "message": message,
                        "context_type": context_type,
                        "session_id": session_id
                    }
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception("Both Ollama and n8n failed")
                    
        except Exception as e:
            return {
                "response": "Entschuldigung, der KI-Service ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.",
                "confidence": "low",
                "processing_time": 0,
                "model_used": "fallback",
                "session_id": session_id
            }
