"""
Run API Server

Entry point for running the FastAPI server
"""

import uvicorn
from api_server import app

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("🛡️  HackrAct AI Agent - API Server")
    print("=" * 70)
    print("API running at: http://localhost:8008")
    print("API Documentation: http://localhost:8008/docs")
    print("WebSocket: ws://localhost:8008/ws/{session_id}")
    print("=" * 70 + "\n")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8008,
        reload=False,  # Disabled for Docker - causes file watcher errors
        log_level="info"
    )
