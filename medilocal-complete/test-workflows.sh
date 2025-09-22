#!/bin/bash

echo "Testing MediLocal AI Workflows..."

# Test Medical AI Chat
echo "1. Testing Medical AI Chat..."
curl -X POST http://localhost:5679/webhook/ai-chat-http \
  -H "Content-Type: application/json" \
  -d '{"message": "Was sind die Symptome einer Grippe?", "context_type": "diagnosis"}'

echo -e "\n\n2. Testing Smart Appointment Scheduling..."
curl -X POST http://localhost:5679/webhook/smart-scheduling \
  -H "Content-Type: application/json" \
  -d '{"patient_name": "Max Mustermann", "symptoms": "Kopfschmerzen", "urgency": "normal"}'

echo -e "\n\n3. Testing Clinical Documentation..."
curl -X POST http://localhost:5679/webhook/auto-documentation \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "12345", "visit_notes": "Patient complains of headache and fever", "diagnosis": "Viral infection"}'

echo -e "\n\nAll tests completed!"
