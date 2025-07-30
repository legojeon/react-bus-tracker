from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes.auth_router import AuthRouter
from app.routes.bus_station_router import BusStationRouter
from app.routes.saved_routes_router import SavedRoutesRouter
from app.database.connection import engine, Base
from app.models.user_model import User  # 모델들을 명시적으로 import
from app.models.bus_station_model import BusStation  # 버스 정류소 모델 import
from app.models.saved_route_model import SavedRoute  # 즐겨찾기 모델 import
from config import settings
import os

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bus Info API",
    description="버스 정보를 제공하는 API",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React 개발 서버
        "http://localhost:5173",  # Vite 개발 서버
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:4173",  # Vite preview
        "http://127.0.0.1:4173",
        "*"  # 모든 origin 허용 (개발 환경용)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 라우터 포함
auth_router = AuthRouter()
saved_routes_router = SavedRoutesRouter()
bus_station_router = BusStationRouter()

app.include_router(auth_router.get_router(), prefix="/api/auth", tags=["auth"])
app.include_router(bus_station_router.get_router(), prefix="/api/stations", tags=["stations"])
app.include_router(saved_routes_router.router, prefix="/api/saved-routes", tags=["saved-routes"])

# 정적 파일 서빙 설정
static_dir = "static"
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    # 정적 파일이 있으면 index.html을 서빙, 없으면 API 메시지 반환
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Bus Info API is running!"}

@app.get("/{path:path}")
async def serve_static_files(path: str):
    """정적 파일 서빙 (SPA 라우팅 지원)"""
    static_path = os.path.join(static_dir, path)
    
    # 파일이 존재하면 서빙
    if os.path.exists(static_path) and os.path.isfile(static_path):
        return FileResponse(static_path)
    
    # 파일이 없으면 index.html을 서빙 (SPA 라우팅)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # index.html도 없으면 404
    return {"error": "Not found"}, 404

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/config/status")
async def config_status():
    """설정 상태 확인 (API 키 등)"""
    return {
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "database_url": settings.DATABASE_URL.split("://")[0] if "://" in settings.DATABASE_URL else "unknown",
        "api_keys": settings.validate_api_keys()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=settings.API_HOST, 
        port=settings.API_PORT,
        log_level=settings.LOG_LEVEL.lower()
    ) 