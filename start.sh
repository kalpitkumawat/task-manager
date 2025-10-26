#!/bin/bash

echo "===================================="
echo "Task Manager - Full Stack Application"
echo "===================================="
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap CTRL+C
trap cleanup INT

# Start Backend
echo "Starting Backend (.NET 8 API)..."
cd Backend
dotnet restore > /dev/null 2>&1
dotnet run &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start Frontend
echo ""
echo "Starting Frontend (React + TypeScript)..."
cd Frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "===================================="
echo "Both servers are running!"
echo "===================================="
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Swagger:  http://localhost:5000/swagger"
echo "===================================="
echo ""
echo "Press CTRL+C to stop all servers"
echo ""

# Wait for both processes
wait
