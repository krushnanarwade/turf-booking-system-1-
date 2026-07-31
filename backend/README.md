# Turf Booking System - FastAPI Backend

This directory contains the Python FastAPI backend service for the Turf Booking System.

## How to Run the Backend Server

### Option 1: Direct Python Execution (Recommended)
You can now run `main.py` directly using Python from the project root or backend folder:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server directly
python app/main.py
```

### Option 2: Running with Uvicorn CLI
Alternatively, run with Uvicorn from the `backend` folder:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Option 3: Docker Compose
To run PostgreSQL database and FastAPI together using Docker:

```bash
cd backend
docker-compose up --build
```

The server will start at `http://localhost:8000` with automatic interactive API documentation at `http://localhost:8000/docs`.
