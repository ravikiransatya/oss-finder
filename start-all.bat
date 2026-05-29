@echo off
echo Starting OSS Finder with AI Project Builder...
echo.

echo Starting Python FastAPI backend on port 8000...
start cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak > nul

echo Starting Node.js AI server on port 8001...
start cmd /k "cd backend && node ai_server_simple.js"

timeout /t 3 /nobreak > nul

echo Starting React frontend on port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo All servers starting...
echo - Backend API: http://localhost:8000
echo - AI Server: http://localhost:8001  
echo - Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul