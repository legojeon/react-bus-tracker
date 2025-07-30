from .base_router import BaseRouter
from ..controllers.auth_controller import AuthController
from ..schemas.user_schema import UserCreate, UserLogin
from ..database.connection import get_db
from ..utils.auth import verify_token
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Dict, Any

security = HTTPBearer()

class AuthRouter(BaseRouter):
    """인증 라우터"""
    
    def __init__(self):
        super().__init__()
        self.setup_routes()
    
    def setup_routes(self):
        """라우트 설정"""
        
        @self.router.post("/register", response_model=Dict[str, Any])
        async def register(user_data: UserCreate, db: Session = Depends(get_db)):
            """사용자 등록"""
            auth_controller = AuthController(db)
            result = auth_controller.register(user_data)
            
            if not result["success"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=result["message"]
                )
            
            return result
        
        @self.router.post("/login", response_model=Dict[str, Any])
        async def login(login_data: UserLogin, db: Session = Depends(get_db)):
            """사용자 로그인"""
            auth_controller = AuthController(db)
            result = auth_controller.login(login_data)
            
            if not result["success"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=result["message"]
                )
            
            return result
        
        @self.router.get("/me", response_model=Dict[str, Any])
        async def get_current_user(
            credentials: HTTPAuthorizationCredentials = Depends(security),
            db: Session = Depends(get_db)
        ):
            """현재 사용자 정보 조회"""
            # 토큰 검증
            username = verify_token(credentials.credentials)
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            auth_controller = AuthController(db)
            result = auth_controller.get_current_user(username)
            
            if not result["success"]:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=result["message"]
                )
            
            return result 