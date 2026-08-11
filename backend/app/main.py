import socket
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, chat, lessons, streak, user, practice
from app.config import settings

app = FastAPI(title="WeTalk AI English Learning API", version="1.0.0")

# CORS middleware to allow mobile app client requests from LAN devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(lessons.router)
app.include_router(streak.router)
app.include_router(user.router)
app.include_router(practice.router)

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "Server is running"}

@app.get("/")
async def root():
    return {"message": "AI English Learning API is running"}

def get_lan_address() -> str:
    """Helper to get local LAN IP address for mobile app connections."""
    try:
        # Create a dummy socket connection to get active LAN IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@app.on_event("startup")
async def startup_event():
    port = settings.PORT
    lan_ip = get_lan_address()
    print("\n" + "="*50)
    print("🚀 WeTalk FastAPI Backend is starting up!")
    print(f"API available locally at:   http://127.0.0.1:{port}")
    print(f"API available on LAN at:    http://{lan_ip}:{port}/api")
    print(f"Swagger Docs available at:  http://127.0.0.1:{port}/docs")
    print("="*50 + "\n")
