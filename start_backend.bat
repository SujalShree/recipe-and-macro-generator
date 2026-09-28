@echo off
echo ===================================================
echo Starting MasalaMacro AI Backend (FastAPI)
echo ===================================================
cd backend
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
pause
