@echo off
echo ====================================
echo Task Manager - Full Stack Application
echo ====================================
echo.

echo Starting Backend (.NET 8 API)...
start "Backend API" cmd /k "cd Backend && dotnet restore && dotnet run"
timeout /t 5

echo.
echo Starting Frontend (React + TypeScript)...
start "Frontend React" cmd /k "cd Frontend && npm install && npm run dev"

echo.
echo ====================================
echo Both servers are starting!
echo ====================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Swagger:  http://localhost:5000/swagger
echo ====================================
echo.
echo Press any key to exit this window...
pause
