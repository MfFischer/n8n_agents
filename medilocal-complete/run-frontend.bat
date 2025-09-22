@echo off
echo ========================================
echo  MediLocal AI - Production Frontend
echo ========================================
echo.

echo Starting the new, improved frontend...
echo.

cd frontend

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
echo Frontend will be available at: http://localhost:3000
echo.

call npm run dev

pause
