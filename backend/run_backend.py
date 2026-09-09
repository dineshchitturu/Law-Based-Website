import os
import sys
import uvicorn

# Ensure the root project directory is on the sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"Starting LawBot AI Backend on http://{host}:{port}")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)
