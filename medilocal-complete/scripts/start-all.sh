#!/bin/bash

# MediLocal AI - Complete System Startup Script
set -e

echo "🏥 Starting MediLocal AI Complete System..."

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start within timeout"
    return 1
}

# Start Ollama in background
echo "🤖 Starting Ollama AI Server..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
sleep 10
wait_for_service "Ollama" "http://localhost:11434/api/tags"

# Download required models
echo "📥 Downloading AI models..."
ollama pull llama3.2:latest
ollama pull llama3.2:1b
ollama pull phi3:mini

# Start n8n in background
echo "🔄 Starting n8n Workflow Engine..."
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=medilocal2024
export N8N_HOST=0.0.0.0
export N8N_PORT=5678
export WEBHOOK_URL=http://localhost:5678
export GENERIC_TIMEZONE=Europe/Berlin
export N8N_DEFAULT_LOCALE=de

n8n start &
N8N_PID=$!

# Wait for n8n to be ready
wait_for_service "n8n" "http://localhost:5678/healthz"

# Import workflows
echo "📋 Importing MediLocal AI workflows..."
sleep 5

# Import each workflow
for workflow_file in /app/workflows/*.json; do
    if [ -f "$workflow_file" ]; then
        workflow_name=$(basename "$workflow_file" .json)
        echo "   Importing $workflow_name..."
        
        # Use n8n CLI to import workflow
        n8n import:workflow --input="$workflow_file" || echo "   Warning: Failed to import $workflow_name"
    fi
done

# Start FastAPI backend
echo "🚀 Starting MediLocal Backend API..."
cd /app

# Run database migrations
python -m alembic upgrade head || echo "Warning: Database migration failed"

# Start the backend API
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
wait_for_service "Backend API" "http://localhost:8000/health"

# Setup signal handlers for graceful shutdown
cleanup() {
    echo "🛑 Shutting down MediLocal AI..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$N8N_PID" ]; then
        kill $N8N_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$OLLAMA_PID" ]; then
        kill $OLLAMA_PID 2>/dev/null || true
    fi
    
    echo "✅ MediLocal AI stopped gracefully"
    exit 0
}

trap cleanup SIGTERM SIGINT

# System is ready
echo ""
echo "🎉 MediLocal AI Complete System is ready!"
echo ""
echo "📊 Access Points:"
echo "   • Frontend:     http://localhost:3000"
echo "   • Backend API:  http://localhost:8000"
echo "   • n8n Workflows: http://localhost:5678"
echo "   • Ollama API:   http://localhost:11434"
echo ""
echo "🔐 Default Credentials:"
echo "   • n8n: admin / medilocal2024"
echo ""
echo "📋 Available AI Workflows:"
echo "   • Medical AI Chat"
echo "   • Intelligent Appointment System"
echo "   • German eRezept Automation"
echo "   • Automated Clinical Documentation"
echo ""
echo "🏥 MediLocal AI is now serving German clinics!"
echo "   Press Ctrl+C to stop all services"

# Keep the script running
wait
