#!/bin/bash

# MediLocal AI - System Test Script
# Tests all workflows and functionality

set -e

echo "🧪 MediLocal AI - System Testing"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}🔍 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test system health
test_health() {
    print_test "System Health Checks"
    
    # Test backend
    if curl -f -s http://localhost:8000/health > /dev/null; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API is not responding"
        return 1
    fi
    
    # Test n8n
    if curl -f -s http://localhost:5678/healthz > /dev/null; then
        print_success "n8n workflow engine is healthy"
    else
        print_error "n8n is not responding"
        return 1
    fi
    
    # Test Ollama
    if curl -f -s http://localhost:11434/api/tags > /dev/null; then
        print_success "Ollama AI server is healthy"
    else
        print_error "Ollama is not responding"
        return 1
    fi
    
    # Test frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
        return 1
    fi
    
    echo ""
}

# Test Medical AI Chat workflow
test_medical_chat() {
    print_test "Medical AI Chat Workflow"
    
    local test_data='{
        "message": "Patient hat Kopfschmerzen und Fieber seit 2 Tagen",
        "context_type": "diagnosis",
        "patient_history": "Keine besonderen Vorerkrankungen"
    }'
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        http://localhost:5678/webhook/ai-chat)
    
    if echo "$response" | grep -q "response"; then
        print_success "Medical AI Chat workflow is working"
        echo "   Sample response: $(echo "$response" | jq -r '.response' 2>/dev/null | head -c 100)..."
    else
        print_error "Medical AI Chat workflow failed"
        echo "   Response: $response"
        return 1
    fi
    
    echo ""
}

# Test Intelligent Appointment System
test_appointments() {
    print_test "Intelligent Appointment System"
    
    local test_data='{
        "patient_request": "Ich brauche einen Termin wegen starker Rückenschmerzen",
        "symptoms": "Starke Schmerzen im unteren Rücken seit gestern",
        "patient_history": "Bandscheibenvorfall 2019"
    }'
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        http://localhost:5678/webhook/smart-scheduling)
    
    if echo "$response" | grep -q "classification"; then
        print_success "Appointment system is working"
        local classification=$(echo "$response" | jq -r '.classification.classification' 2>/dev/null)
        echo "   Classification: $classification"
    else
        print_error "Appointment system failed"
        echo "   Response: $response"
        return 1
    fi
    
    echo ""
}

# Test eRezept Automation
test_erezept() {
    print_test "German eRezept Automation"
    
    local test_data='{
        "patient_id": "PAT001",
        "egk_number": "80276001234567890",
        "symptoms": "Kopfschmerzen, Fieber",
        "diagnosis": "Akute Bronchitis (J20.9)",
        "current_medications": "Keine",
        "allergies": "Keine bekannt",
        "doctor_id": "DR001",
        "consultation_notes": "Patient benötigt Schmerzmittel"
    }'
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        http://localhost:5678/webhook/erezept-automation)
    
    if echo "$response" | grep -q "erezept_transmitted"; then
        print_success "eRezept automation is working"
        local prescription_id=$(echo "$response" | jq -r '.transmission_result.erezept_id' 2>/dev/null)
        echo "   eRezept ID: $prescription_id"
    else
        print_error "eRezept automation failed"
        echo "   Response: $response"
        return 1
    fi
    
    echo ""
}

# Test Clinical Documentation
test_documentation() {
    print_test "Automated Clinical Documentation"
    
    local test_data='{
        "patient_id": "PAT001",
        "consultation_notes": "Patient mit akuten Rückenschmerzen",
        "vital_signs": {"blood_pressure": "120/80", "pulse": "72", "temperature": "36.5"},
        "symptoms": "Starke Schmerzen im unteren Rücken",
        "examination_findings": "Bewegungseinschränkung, Druckschmerz L4/L5",
        "doctor_id": "DR001",
        "consultation_type": "routine"
    }'
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        http://localhost:5678/webhook/auto-documentation)
    
    if echo "$response" | grep -q "success"; then
        print_success "Clinical documentation is working"
        local time_saved=$(echo "$response" | jq -r '.time_saved' 2>/dev/null)
        echo "   Time saved: $time_saved"
    else
        print_error "Clinical documentation failed"
        echo "   Response: $response"
        return 1
    fi
    
    echo ""
}

# Test database connectivity
test_database() {
    print_test "Database Connectivity"
    
    if docker-compose exec -T postgres psql -U medilocal -d medilocal -c "SELECT COUNT(*) FROM medical.patients;" > /dev/null 2>&1; then
        print_success "Database is accessible"
        local patient_count=$(docker-compose exec -T postgres psql -U medilocal -d medilocal -t -c "SELECT COUNT(*) FROM medical.patients;" | tr -d ' ')
        echo "   Patient records: $patient_count"
    else
        print_error "Database connection failed"
        return 1
    fi
    
    echo ""
}

# Test AI models
test_ai_models() {
    print_test "AI Models Availability"
    
    local models=$(curl -s http://localhost:11434/api/tags | jq -r '.models[].name' 2>/dev/null)
    
    if echo "$models" | grep -q "llama3.2"; then
        print_success "Llama 3.2 models are available"
        echo "$models" | while read model; do
            echo "   - $model"
        done
    else
        print_error "AI models not found"
        return 1
    fi
    
    echo ""
}

# Performance test
test_performance() {
    print_test "Performance Test"
    
    local start_time=$(date +%s%N)
    
    # Simple AI request
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"message": "Test", "context_type": "general"}' \
        http://localhost:5678/webhook/ai-chat > /dev/null
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ $duration -lt 30000 ]; then
        print_success "Performance test passed"
        echo "   Response time: ${duration}ms"
    else
        print_warning "Performance test slow"
        echo "   Response time: ${duration}ms (>30s)"
    fi
    
    echo ""
}

# Main test function
main() {
    echo "Starting comprehensive system tests..."
    echo ""
    
    local failed_tests=0
    
    # Run all tests
    test_health || ((failed_tests++))
    test_database || ((failed_tests++))
    test_ai_models || ((failed_tests++))
    test_medical_chat || ((failed_tests++))
    test_appointments || ((failed_tests++))
    test_erezept || ((failed_tests++))
    test_documentation || ((failed_tests++))
    test_performance || ((failed_tests++))
    
    # Summary
    echo "================================"
    if [ $failed_tests -eq 0 ]; then
        print_success "All tests passed! 🎉"
        echo ""
        echo "🏥 MediLocal AI is fully functional and ready for production!"
        echo ""
        echo "📊 Access your system at:"
        echo "   • Frontend: http://localhost:3000"
        echo "   • Backend:  http://localhost:8000"
        echo "   • n8n:      http://localhost:5678"
        echo ""
    else
        print_error "$failed_tests test(s) failed"
        echo ""
        echo "Please check the system logs:"
        echo "   docker-compose logs"
        echo ""
        exit 1
    fi
}

# Check if jq is available
if ! command -v jq &> /dev/null; then
    print_warning "jq not found. Installing for JSON parsing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v yum &> /dev/null; then
        sudo yum install -y jq
    else
        print_warning "Please install jq manually for better test output"
    fi
fi

# Run tests
main "$@"
