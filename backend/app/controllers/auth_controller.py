from .base_controller import BaseController
from ..services.user_service import UserService
from ..schemas.user_schema import UserCreate, UserLogin, UserResponse, Token
from ..utils.helpers import format_response
from sqlalchemy.orm import Session
from typing import Dict, Any

class AuthController(BaseController):
    """인증 컨트롤러"""
    
    def __init__(self, db: Session):
        super().__init__()
        self.user_service = UserService(db)
    
    def register(self, user_data: UserCreate) -> Dict[str, Any]:
        """사용자 등록"""
        try:
            # 사용자명 중복 확인
            if self.user_service.get_user_by_username(user_data.username):
                return format_response(False, "Username already registered")
            
            # 이메일 중복 확인
            if self.user_service.get_user_by_email(user_data.email):
                return format_response(False, "Email already registered")
            
            # 사용자 생성
            user = self.user_service.create_user(user_data)
            
            # 응답 데이터 생성 (비밀번호 제외)
            user_response = UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                is_active=user.is_active,
                is_superuser=user.is_superuser
            )
            
            return format_response(True, "User registered successfully", user_response.dict())
            
        except Exception as e:
            return format_response(False, f"Registration failed: {str(e)}")
    
    def login(self, login_data: UserLogin) -> Dict[str, Any]:
        """사용자 로그인"""
        try:
            # 사용자 인증
            user = self.user_service.authenticate_user(login_data.username, login_data.password)
            
            if not user:
                return format_response(False, "Invalid username or password")
            
            if not user.is_active:
                return format_response(False, "User account is disabled")
            
            # 액세스 토큰 생성
            token_data = self.user_service.create_access_token_for_user(user)
            
            return format_response(True, "Login successful", token_data)
            
        except Exception as e:
            return format_response(False, f"Login failed: {str(e)}")
    
    def get_current_user(self, username: str) -> Dict[str, Any]:
        """현재 사용자 정보 조회"""
        try:
            user = self.user_service.get_user_by_username(username)
            
            if not user:
                return format_response(False, "User not found")
            
            user_response = UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                is_active=user.is_active,
                is_superuser=user.is_superuser
            )
            
            return format_response(True, "User information retrieved", user_response.dict())
            
        except Exception as e:
            return format_response(False, f"Failed to get user information: {str(e)}") 