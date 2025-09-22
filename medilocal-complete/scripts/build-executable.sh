#!/bin/bash

# MediLocal AI - Executable Builder
# Creates standalone executables for Windows and Linux

set -e

echo "🏥 Building MediLocal AI Standalone Executables..."

# Create build directory
mkdir -p dist
cd dist

# Build frontend
echo "📦 Building frontend..."
cd ../frontend
npm install
npm run build
cd ../dist

# Copy built frontend
cp -r ../frontend/dist ./frontend-dist

# Create Python executable with PyInstaller
echo "🐍 Creating Python executable..."

# Install PyInstaller if not present
pip install pyinstaller

# Create main executable script
cat > medilocal_main.py << 'EOF'
#!/usr/bin/env python3
"""
MediLocal AI - Standalone Executable
Complete clinic automation system in a single executable
"""

import os
import sys
import subprocess
import threading
import time
import signal
import webbrowser
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_port(port):
    """Check if port is available"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) != 0

def wait_for_service(url, timeout=60):
    """Wait for service to be ready"""
    import requests
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return True
        except:
            pass
        time.sleep(2)
    return False

def start_ollama():
    """Start Ollama server"""
    print("🤖 Starting Ollama AI server...")
    
    # Check if Ollama is installed
    try:
        subprocess.run(['ollama', '--version'], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Ollama not found. Please install Ollama first.")
        print("   Download from: https://ollama.ai/download")
        return None
    
    # Start Ollama server
    process = subprocess.Popen(['ollama', 'serve'], 
                              stdout=subprocess.PIPE, 
                              stderr=subprocess.PIPE)
    
    # Wait for Ollama to be ready
    if wait_for_service('http://localhost:11434/api/tags'):
        print("✅ Ollama server ready")
        
        # Download required models
        print("📥 Downloading AI models...")
        subprocess.run(['ollama', 'pull', 'llama3.2:latest'])
        subprocess.run(['ollama', 'pull', 'llama3.2:1b'])
        
        return process
    else:
        print("❌ Ollama server failed to start")
        return None

def start_n8n():
    """Start n8n workflow engine"""
    print("🔄 Starting n8n workflow engine...")
    
    # Set n8n environment variables
    env = os.environ.copy()
    env.update({
        'N8N_BASIC_AUTH_ACTIVE': 'true',
        'N8N_BASIC_AUTH_USER': 'admin',
        'N8N_BASIC_AUTH_PASSWORD': 'medilocal2024',
        'N8N_HOST': '0.0.0.0',
        'N8N_PORT': '5678',
        'WEBHOOK_URL': 'http://localhost:5678',
        'GENERIC_TIMEZONE': 'Europe/Berlin',
        'N8N_DEFAULT_LOCALE': 'de'
    })
    
    # Start n8n
    try:
        process = subprocess.Popen(['npx', 'n8n', 'start'], 
                                  env=env,
                                  stdout=subprocess.PIPE, 
                                  stderr=subprocess.PIPE)
        
        # Wait for n8n to be ready
        if wait_for_service('http://localhost:5678/healthz'):
            print("✅ n8n workflow engine ready")
            return process
        else:
            print("❌ n8n failed to start")
            return None
    except FileNotFoundError:
        print("❌ Node.js/npm not found. Please install Node.js first.")
        return None

def start_backend():
    """Start FastAPI backend"""
    print("🚀 Starting MediLocal backend...")
    
    # Import and start FastAPI app
    try:
        from app.main import app
        import uvicorn
        
        # Start uvicorn in a thread
        def run_server():
            uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
        
        thread = threading.Thread(target=run_server, daemon=True)
        thread.start()
        
        # Wait for backend to be ready
        if wait_for_service('http://localhost:8000/health'):
            print("✅ Backend API ready")
            return thread
        else:
            print("❌ Backend failed to start")
            return None
    except ImportError as e:
        print(f"❌ Backend import failed: {e}")
        return None

def start_frontend():
    """Start frontend server"""
    print("💻 Starting frontend server...")
    
    # Simple HTTP server for frontend
    import http.server
    import socketserver
    from functools import partial
    
    # Change to frontend directory
    frontend_dir = Path(__file__).parent / 'frontend-dist'
    if not frontend_dir.exists():
        print("❌ Frontend files not found")
        return None
    
    os.chdir(frontend_dir)
    
    # Start HTTP server
    handler = partial(http.server.SimpleHTTPRequestHandler)
    
    def run_frontend():
        with socketserver.TCPServer(("", 3000), handler) as httpd:
            httpd.serve_forever()
    
    thread = threading.Thread(target=run_frontend, daemon=True)
    thread.start()
    
    # Wait for frontend to be ready
    time.sleep(2)
    if wait_for_service('http://localhost:3000'):
        print("✅ Frontend ready")
        return thread
    else:
        print("❌ Frontend failed to start")
        return None

def main():
    """Main application entry point"""
    print("🏥 MediLocal AI - Starting Complete System...")
    print("=" * 50)
    
    processes = []
    
    # Check required ports
    required_ports = [3000, 8000, 5678, 11434]
    for port in required_ports:
        if not check_port(port):
            print(f"❌ Port {port} is already in use")
            return 1
    
    try:
        # Start services
        ollama_process = start_ollama()
        if ollama_process:
            processes.append(ollama_process)
        
        n8n_process = start_n8n()
        if n8n_process:
            processes.append(n8n_process)
        
        backend_thread = start_backend()
        frontend_thread = start_frontend()
        
        # System ready
        print("\n" + "=" * 50)
        print("🎉 MediLocal AI is ready!")
        print("\n📊 Access Points:")
        print("   • Frontend:      http://localhost:3000")
        print("   • Backend API:   http://localhost:8000")
        print("   • n8n Workflows: http://localhost:5678")
        print("   • Ollama AI:     http://localhost:11434")
        print("\n🔐 Default Credentials:")
        print("   • n8n: admin / medilocal2024")
        print("\n🏥 Opening MediLocal AI in your browser...")
        
        # Open browser
        time.sleep(3)
        webbrowser.open('http://localhost:3000')
        
        # Keep running
        print("\nPress Ctrl+C to stop all services")
        
        # Signal handler for graceful shutdown
        def signal_handler(sig, frame):
            print("\n🛑 Shutting down MediLocal AI...")
            for process in processes:
                try:
                    process.terminate()
                except:
                    pass
            print("✅ MediLocal AI stopped")
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Wait indefinitely
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
        for process in processes:
            try:
                process.terminate()
            except:
                pass
        return 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
EOF

# Copy backend files
echo "📁 Copying backend files..."
cp -r ../backend ./backend

# Create PyInstaller spec file
cat > medilocal.spec << 'EOF'
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['medilocal_main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('backend', 'backend'),
        ('frontend-dist', 'frontend-dist'),
    ],
    hiddenimports=[
        'uvicorn',
        'fastapi',
        'sqlalchemy',
        'alembic',
        'pydantic',
        'requests',
        'psycopg2',
        'redis',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='medilocal-ai',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
EOF

# Build executable
echo "🔨 Building executable..."
pyinstaller medilocal.spec --clean --noconfirm

# Create installer script
cat > install.sh << 'EOF'
#!/bin/bash
echo "🏥 MediLocal AI - Installation"
echo "Installing system dependencies..."

# Install Ollama
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

# Install Node.js (for n8n)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install n8n
if ! command -v n8n &> /dev/null; then
    echo "Installing n8n..."
    npm install -g n8n
fi

echo "✅ Installation complete!"
echo "Run: ./medilocal-ai"
EOF

chmod +x install.sh

# Create Windows installer
cat > install.bat << 'EOF'
@echo off
echo 🏥 MediLocal AI - Windows Installation
echo Installing system dependencies...

echo Please install the following manually:
echo 1. Ollama: https://ollama.ai/download
echo 2. Node.js: https://nodejs.org/download
echo 3. Then run: npm install -g n8n

echo After installation, run: medilocal-ai.exe
pause
EOF

chmod +x ../scripts/build-executable.sh

echo "✅ Executable build complete!"
echo ""
echo "📦 Files created:"
echo "   • dist/medilocal-ai (Linux executable)"
echo "   • dist/install.sh (Linux installer)"
echo "   • dist/install.bat (Windows installer)"
echo ""
echo "🚀 To distribute:"
echo "   1. Copy dist/ folder to target machine"
echo "   2. Run install script for dependencies"
echo "   3. Run ./medilocal-ai executable"

cd ..
