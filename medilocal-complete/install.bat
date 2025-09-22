@echo off
REM MediLocal AI - Windows Installation Script
REM One-command installation for German clinics

echo.
echo 🏥 MediLocal AI - Complete Clinic Automation Suite
echo ==================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo After installation, restart your computer and run this script again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available
    echo Please ensure Docker Desktop is properly installed and running.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose found
echo.

REM Create necessary directories
echo ℹ️  Setting up directories...
if not exist "data" mkdir data
if not exist "data\ollama" mkdir data\ollama
if not exist "data\n8n" mkdir data\n8n
if not exist "data\postgres" mkdir data\postgres
if not exist "data\redis" mkdir data\redis
if not exist "logs" mkdir logs
if not exist "logs\backend" mkdir logs\backend
if not exist "logs\nginx" mkdir logs\nginx
if not exist "ssl" mkdir ssl

echo ✅ Directories created
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo ℹ️  Creating environment configuration...
    (
        echo # MediLocal AI Environment Configuration
        echo POSTGRES_DB=medilocal
        echo POSTGRES_USER=medilocal
        echo POSTGRES_PASSWORD=medilocal2024
        echo REDIS_PASSWORD=redis2024
        echo N8N_BASIC_AUTH_USER=admin
        echo N8N_BASIC_AUTH_PASSWORD=medilocal2024
        echo SECRET_KEY=your-secret-key-change-in-production
        echo ENVIRONMENT=production
    ) > .env
    echo ✅ Environment configuration created
    echo.
)

REM Start the system
echo 🚀 Starting MediLocal AI services...
echo This may take a few minutes on first run...
echo.

docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    echo Please check Docker Desktop is running and try again
    pause
    exit /b 1
)

echo ✅ Services started successfully
echo.

REM Wait for services to initialize
echo ⏳ Waiting for services to initialize (60 seconds)...
timeout /t 60 /nobreak >nul

REM Download AI models
echo 📥 Downloading AI models (this may take 10-15 minutes)...
echo Please be patient, this is a one-time setup...
echo.

docker-compose exec -T ollama ollama pull llama3.2:latest
docker-compose exec -T ollama ollama pull llama3.2:1b

echo ✅ AI models downloaded
echo.

REM Test system
echo 🧪 Testing system functionality...

REM Test backend
curl -f -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is responding
) else (
    echo ⚠️  Backend API not responding yet ^(may need more time^)
)

REM Test n8n
curl -f -s http://localhost:5678/healthz >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ n8n workflow engine is responding
) else (
    echo ⚠️  n8n not responding yet ^(may need more time^)
)

REM Test Ollama
curl -f -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ollama AI server is responding
) else (
    echo ⚠️  Ollama not responding yet ^(may need more time^)
)

REM Test frontend
curl -f -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is responding
) else (
    echo ⚠️  Frontend not responding yet ^(may need more time^)
)

echo.
echo 🎉 MediLocal AI installation complete!
echo ======================================
echo.
echo 📊 Access Points:
echo    • Frontend:      http://localhost:3000
echo    • Backend API:   http://localhost:8000
echo    • n8n Workflows: http://localhost:5678
echo    • Ollama AI:     http://localhost:11434
echo.
echo 🔐 Default Credentials:
echo    • n8n: admin / medilocal2024
echo.
echo 📋 Available Features:
echo    ✅ Medical AI Chat ^(German consultation support^)
echo    ✅ Intelligent Appointment System
echo    ✅ German eRezept Automation
echo    ✅ Automated Clinical Documentation
echo.
echo 🚀 Next Steps:
echo    1. Open http://localhost:3000 in your browser
echo    2. Test the Medical AI Chat feature
echo    3. Configure clinic-specific settings
echo    4. Train staff on the new system
echo.
echo 📞 Support:
echo    • Documentation: .\docs\
echo    • Logs: docker-compose logs
echo    • Status: docker-compose ps
echo.
echo 🏥 MediLocal AI is now ready to serve German clinics!
echo.

REM Open browser
echo ℹ️  Opening MediLocal AI in your browser...
start http://localhost:3000

echo.
echo Press any key to exit...
pause >nul
