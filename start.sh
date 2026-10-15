#!/bin/bash

# MobiStock Startup Script
echo "=========================================="
echo "  🚀 Starting MobiStock Management System "
echo "=========================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PG_DATA="/Users/sushantsurange/.gemini/antigravity-ide/scratch/pg_data"
PG_BIN="/Users/sushantsurange/.gemini/antigravity-ide/scratch/pg_env/bin"

# 1. Start PostgreSQL if not already running
if ! pg_isready -h localhost -p 5432 -U postgres 2>/dev/null; then
  echo "🐘 Starting PostgreSQL server..."
  "$PG_BIN/pg_ctl" -D "$PG_DATA" -l "$PG_DATA/server.log" start
else
  echo "✅ PostgreSQL is already running."
fi

# 2. Start Backend API
echo "⚡ Starting Backend API on port 5050..."
cd "$PROJECT_DIR/backend"
npm run dev &
BACKEND_PID=$!

# 3. Start Frontend
echo "💻 Starting Frontend on port 5173..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "=========================================="
echo "  MobiStock is running!"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend:  http://localhost:5050"
echo "  - Admin:    admin@phonestore.com / password123"
echo "=========================================="

wait
