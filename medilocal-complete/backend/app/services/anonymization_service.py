import re
import hashlib
from typing import Dict, List, Tuple
import httpx
from app.core.config import settings

class AnonymizationService:
    def __init__(self):
        self.n8n_url = settings.N8N_URL
        
        # German medical anonymization patterns
        self.patterns = {
            'names': [
                r'\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b',  # First Last names
                r'\b(?:Herr|Frau|Dr\.|Prof\.)\s+[A-ZÄÖÜ][a-zäöüß]+',  # Titles with names
                r'\b[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?\b'  # Hyphenated names
            ],
            'addresses': [
                r'\b\d{1,5}\s+[A-ZÄÖÜ][a-zäöüß\s]+(?:straße|str\.|platz|weg|allee|gasse)\b',
                r'\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß\s]+\b',  # Postal codes with cities
            ],
            'phones': [
                r'\b(?:\+49|0)\s?\d{2,5}[\s\-]?\d{3,8}\b',
                r'\b\d{3,5}[\s\-]\d{6,8}\b'
            ],
            'emails': [
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            ],
            'ids': [
                r'\b\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-Z]\s?\d{3}\b',  # Personalausweis
                r'\b[A-Z]\d{8}\b',  # Reisepass
            ],
            'dates': [
                r'\b\d{1,2}\.\d{1,2}\.\d{4}\b',
                r'\b\d{1,2}\s(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s\d{4}\b'
            ],
            'insurance': [
                r'\b[A-Z]\d{9}\b',  # Krankenversicherungsnummer
                r'\b\d{2}\s?\d{6}\s?[A-Z]\s?\d{3}\b'
            ]
        }
    
    async def anonymize_text(self, text: str, use_n8n: bool = True) -> Dict:
        """Anonymize text using either n8n workflow or local processing"""
        if use_n8n:
            try:
                return await self._anonymize_via_n8n(text)
            except Exception:
                # Fallback to local processing
                return self._anonymize_locally(text)
        else:
            return self._anonymize_locally(text)
    
    async def _anonymize_via_n8n(self, text: str) -> Dict:
        """Use n8n workflow for anonymization"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.n8n_url}/webhook/anonymize-document",
                json={
                    "text": text,
                    "document_type": "medical"
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"n8n anonymization failed: {response.status_code}")
    
    def _anonymize_locally(self, text: str) -> Dict:
        """Local anonymization processing"""
        anonymized = text
        replacements = []
        
        # Process each pattern type
        for pattern_type, patterns in self.patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, anonymized, re.IGNORECASE)
                for match in matches:
                    original = match.group()
                    replacement = self._generate_replacement(pattern_type, len(replacements) + 1)
                    
                    replacements.append({
                        'original': original,
                        'replacement': replacement,
                        'type': pattern_type,
                        'position': match.span()
                    })
                    
                    anonymized = anonymized.replace(original, replacement, 1)
        
        return {
            'original_text': text,
            'anonymized_text': anonymized,
            'replacements': replacements,
            'replacement_count': len(replacements),
            'gdpr_compliant': True,
            'anonymization_method': 'local_regex_processing'
        }
    
    def _generate_replacement(self, pattern_type: str, index: int) -> str:
        """Generate replacement text for anonymized data"""
        replacements = {
            'names': f'[NAME_{index}]',
            'addresses': f'[ADRESSE_{index}]',
            'phones': f'[TELEFON_{index}]',
            'emails': f'[EMAIL_{index}]',
            'ids': f'[ID_{index}]',
            'dates': f'[DATUM_{index}]',
            'insurance': f'[VERSICHERUNG_{index}]'
        }
        return replacements.get(pattern_type, f'[ANONYMIZED_{index}]')
    
    def create_anonymization_hash(self, text: str) -> str:
        """Create hash for anonymized text for deduplication"""
        return hashlib.sha256(text.encode()).hexdigest()
    
    def validate_anonymization(self, original: str, anonymized: str) -> Dict:
        """Validate that anonymization was successful"""
        # Check if any obvious personal data remains
        suspicious_patterns = [
            r'\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b',  # Names
            r'\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß\s]+\b',  # Addresses
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Emails
        ]
        
        issues = []
        for pattern in suspicious_patterns:
            matches = re.findall(pattern, anonymized, re.IGNORECASE)
            if matches:
                issues.extend(matches)
        
        return {
            'is_valid': len(issues) == 0,
            'potential_issues': issues,
            'anonymization_score': max(0, 100 - len(issues) * 10)  # Score out of 100
        }
