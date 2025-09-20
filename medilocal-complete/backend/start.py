#!/usr/bin/env python3
"""
Startup script for MediLocal Backend
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, '/app')
sys.path.insert(0, '/app/app')

# Set environment variables
os.environ['PYTHONPATH'] = '/app'

# Import and run the application
try:
    from app.main import app
    import uvicorn
    
    if __name__ == "__main__":
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
        
except ImportError as e:
    print(f"Import error: {e}")
    print("Trying simplified version...")
    try:
        from app.main_simple import app
        import uvicorn
        
        if __name__ == "__main__":
            uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    except ImportError as e2:
        print(f"Simplified import also failed: {e2}")
        print("Available files in /app:")
        for root, dirs, files in os.walk('/app'):
            level = root.replace('/app', '').count(os.sep)
            indent = ' ' * 2 * level
            print(f"{indent}{os.path.basename(root)}/")
            subindent = ' ' * 2 * (level + 1)
            for file in files:
                print(f"{subindent}{file}")
        sys.exit(1)
