"""
HackrAct AI Agent - REST API Server

FastAPI server exposing the agent via REST API and WebSocket for frontend integration.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import json
import uuid
import os
from datetime import datetime

from agent import Agent
from config import load_config

# Initialize FastAPI app
app = FastAPI(
    title="HackrAct AI Agent API",
    description="REST API for HackrAct AI penetration testing agent",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active agents and conversations
active_agents: Dict[str, Agent] = {}
conversations: Dict[str, List[Dict]] = {}


def format_error_message(error: Exception) -> str:
    """Format error message for user display"""
    error_str = str(error)
    
    if "AuthenticationError" in error_str or "Missing Anthropic API Key" in error_str or "Missing OpenAI API Key" in error_str or "Missing Gemini API Key" in error_str:
        return "Authentication failed: Missing or invalid API Key. Please check your settings."
    
    if "OpenAIException - The api_key client option must be set" in error_str:
        return "Authentication failed: GitHub Models requires a valid Personal Access Token. Please check your settings."

    if "ConnectionError" in error_str or "ConnectTimeout" in error_str:
        return "Connection failed: Could not connect to the AI provider. Please check your internet connection."
        
    if "RateLimitError" in error_str:
        return "Rate limit exceeded: Please try again later or check your API quota."
        
    if "ModelNotFoundError" in error_str:
        return "Model not found: The selected model is not available. Please check your settings."
        
    # Return generic error for other cases, but stripped of technical details if possible
    # If it starts with "Error:", strip it
    if error_str.startswith("Error: "):
        error_str = error_str[7:]
        
    return f"An error occurred: {error_str.split(' - ')[0] if ' - ' in error_str else error_str}"


# Pydantic models for API
class MessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class MessageResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str


class SessionInfo(BaseModel):
    session_id: str
    created_at: str
    message_count: int


class HealthResponse(BaseModel):
    status: str
    version: str
    agent_name: str


# Helper functions
def get_or_create_agent(session_id: str) -> Agent:
    """Get existing agent or create new one for session"""
    if session_id not in active_agents:
        config = load_config()
        active_agents[session_id] = Agent(config)
        conversations[session_id] = []
    return active_agents[session_id]


def save_message(session_id: str, role: str, content: str):
    """Save message to conversation history"""
    if session_id not in conversations:
        conversations[session_id] = []
    
    conversations[session_id].append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    })


# API Endpoints

@app.get("/api/health", response_model=HealthResponse)
async def api_health_check():
    """Health check endpoint"""
    config = load_config()
    return {
        "status": "online",
        "version": "1.0.0",
        "agent_name": config.name
    }


@app.post("/api/message", response_model=MessageResponse)
async def send_message(request: MessageRequest):
    """
    Send a message to the agent and get response
    
    - **message**: The message/request to send to the agent
    - **session_id**: Optional session ID to maintain conversation context
    """
    # Generate or use provided session ID
    session_id = request.session_id or str(uuid.uuid4())
    
    # Get or create agent for this session
    agent = get_or_create_agent(session_id)
    
    # Save user message
    save_message(session_id, "user", request.message)
    
    try:
        # Process message with agent
        response = await agent.process_message(request.message)
        
        # Save agent response
        save_message(session_id, "assistant", response)
        
        return {
            "response": response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        error_msg = format_error_message(e)
        raise HTTPException(status_code=500, detail=f"Agent error: {error_msg}")


@app.get("/api/sessions", response_model=List[SessionInfo])
async def list_sessions():
    """List all active sessions"""
    sessions = []
    for session_id, messages in conversations.items():
        sessions.append({
            "session_id": session_id,
            "created_at": messages[0]["timestamp"] if messages else datetime.now().isoformat(),
            "message_count": len(messages)
        })
    return sessions


@app.get("/api/session/{session_id}/history")
async def get_session_history(session_id: str):
    """Get conversation history for a session"""
    if session_id not in conversations:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "messages": conversations[session_id]
    }


@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its conversation history"""
    if session_id in active_agents:
        del active_agents[session_id]
    if session_id in conversations:
        del conversations[session_id]
    
    return {"status": "deleted", "session_id": session_id}


@app.post("/api/session/{session_id}/clear")
async def clear_session(session_id: str):
    """Clear conversation history but keep agent instance"""
    if session_id not in conversations:
        raise HTTPException(status_code=404, detail="Session not found")
    
    conversations[session_id] = []
    
    # Reset agent's message history
    if session_id in active_agents:
        active_agents[session_id].messages = []
    
    return {"status": "cleared", "session_id": session_id}


@app.post("/api/session/{session_id}/stop")
async def stop_agent(session_id: str):
    """Stop the agent if it's currently running"""
    if session_id in active_agents:
        active_agents[session_id].stop()
        return {"status": "stopped", "session_id": session_id}
    return {"status": "not_running", "session_id": session_id}


# WebSocket endpoint for real-time streaming
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time agent interaction
    
    Send JSON: {"message": "your message"}
    Receive JSON: {"type": "response|thinking|tool|error", "content": "..."}
    """
    await websocket.accept()
    
    # Get or create agent
    agent = get_or_create_agent(session_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle stop command
            if message_data.get("type") == "stop":
                agent.stop()
                await websocket.send_json({
                    "type": "status",
                    "content": "🛑 Stopping agent..."
                })
                continue

            user_message = message_data.get("message", "")
            
            if not user_message:
                await websocket.send_json({
                    "type": "error",
                    "content": "Empty message"
                })
                continue
            
            # Save user message
            save_message(session_id, "user", user_message)
            
            # Send acknowledgment
            await websocket.send_json({
                "type": "status",
                "content": "Processing..."
            })
            
            try:
                # Define callback for status updates
                async def status_callback(type: str, content: str):
                    await websocket.send_json({
                        "type": type,
                        "content": content
                    })
                
                # Set callback on agent
                agent.set_callback(status_callback)
                
                # Process message
                # Note: For true streaming, you'd need to modify the agent
                # to yield chunks instead of returning complete response
                response = await agent.process_message(user_message)
                
                # Clear callback
                agent.set_callback(None)
                
                # Save response
                save_message(session_id, "assistant", response)
                
                # Send complete response
                await websocket.send_json({
                    "type": "response",
                    "content": response,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                error_msg = format_error_message(e)
                await websocket.send_json({
                    "type": "error",
                    "content": error_msg
                })
    
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session: {session_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")


# Memory endpoints
@app.get("/api/memory/count")
async def get_memory_count():
    """Get count of items in memory"""
    config = load_config()
    if config.memory.enabled:
        from python.helpers.memory import Memory
        memory = Memory(
            memory_dir=config.memory.memory_dir,
            collection_name=config.memory.collection_name,
            embedding_model=config.model.embedding_model,
            api_key=config.model.api_key
        )
        count = memory.count()
        return {"count": count}
    return {"count": 0, "enabled": False}


@app.get("/api/memory/search")
async def search_memory(query: str, max_results: int = 5):
    """Search memory for relevant information"""
    config = load_config()
    if not config.memory.enabled:
        raise HTTPException(status_code=503, detail="Memory not enabled")
    
    from python.helpers.memory import Memory
    memory = Memory(
        memory_dir=config.memory.memory_dir,
        collection_name=config.memory.collection_name,
        embedding_model=config.model.embedding_model,
        api_key=config.model.api_key
    )
    
    results = await memory.recall(query, max_results)
    return {"query": query, "results": results}


class TestConnectionRequest(BaseModel):
    llm_provider: str
    api_key: str
    chat_model: str
    custom_endpoint: Optional[str] = None


@app.post("/api/test_connection")
async def test_connection(request: TestConnectionRequest):
    """Test LLM connection with provided settings"""
    from python.helpers.llm import LLM
    
    try:
        # Initialize LLM with provided settings
        llm = LLM(
            provider=request.llm_provider,
            api_key=request.api_key,
            model=request.chat_model,
            custom_api_base=request.custom_endpoint or ""
        )
        
        # Try a simple generation
        response = await llm.chat([{"role": "user", "content": "Hello"}], max_tokens=10)
        
        if response.startswith("Error:"):
             raise HTTPException(status_code=400, detail=response)
             
        return {"status": "success", "message": "Connection successful!", "response": response}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")


@app.get("/api/settings")
async def get_settings():
    """Get current configuration settings"""
    config = load_config()
    
    return {
        "llm_provider": config.model.provider,
        "api_key": config.model.api_key if config.model.api_key else "",
        "chat_model": config.model.chat_model,
        "utility_model": config.model.utility_model,
        "custom_endpoint": config.model.custom_api_base,
        "memory_enabled": config.memory.enabled,
        "collection_name": config.memory.collection_name,
        "embedding_model": config.model.embedding_model,
        "temperature": config.model.temperature,
        "max_tokens": config.model.max_tokens
    }


@app.post("/api/settings")
async def save_settings(settings: Dict[str, Any]):
    """Save configuration settings to .env file"""
    from config import save_config_to_env
    
    try:
        success = save_config_to_env(settings)
        if success:
            # Reload dotenv to pick up changes
            from dotenv import load_dotenv
            load_dotenv(override=True)
            
            # Clear active agents so they are recreated with new config
            active_agents.clear()
            
            return {"status": "success", "message": "Settings saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save settings")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving settings: {str(e)}")


@app.post("/api/memory/clear")
async def clear_memory():
    """Clear all memories"""
    config = load_config()
    if not config.memory.enabled:
        raise HTTPException(status_code=503, detail="Memory not enabled")
    
    try:
        from python.helpers.memory import Memory
        memory = Memory(
            memory_dir=config.memory.memory_dir,
            collection_name=config.memory.collection_name,
            embedding_model=config.model.embedding_model,
            api_key=config.model.api_key
        )
        
        # Clear the collection
        memory.collection.delete(where={})
        
        return {"status": "success", "message": "All memories cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing memories: {str(e)}")


@app.get("/api/memory/list")
async def list_memories():
    """List all memories"""
    config = load_config()
    if not config.memory.enabled:
        raise HTTPException(status_code=503, detail="Memory not enabled")
    
    try:
        from python.helpers.memory import Memory
        memory = Memory(
            memory_dir=config.memory.memory_dir,
            collection_name=config.memory.collection_name,
            embedding_model=config.model.embedding_model,
            api_key=config.model.api_key
        )
        
        # Get all items from collection
        result = memory.collection.get()
        
        memories = []
        if result and 'documents' in result:
            for i, doc in enumerate(result['documents']):
                memories.append({
                    'id': result['ids'][i] if 'ids' in result else i,
                    'content': doc,
                    'metadata': result['metadatas'][i] if 'metadatas' in result else {}
                })
        
        return {"count": len(memories), "memories": memories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing memories: {str(e)}")


# Serve static files (Frontend)
# We mount this LAST so it doesn't override API routes
app.mount("/", StaticFiles(directory="static", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8008,
        reload=False,  # Disabled for Docker
        log_level="info"
    )
