from .base_service import BaseService
from ..models.user_model import User
from ..schemas.user_schema import UserCreate, UserUpdate
from ..utils.auth import get_password_hash, verify_password, create_access_token
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import timedelta
import os

class UserService(BaseService):
    """사용자 서비스"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """사용자명으로 사용자 조회"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        return self.db.query(User).filter(User.email == email).first()
    
    def create_user(self, user_data: UserCreate) -> User:
        """사용자 생성"""
        # 비밀번호 해싱
        hashed_password = get_password_hash(user_data.password)
        
        # 사용자 객체 생성
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """사용자 인증"""
        user = self.get_user_by_username(username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def create_access_token_for_user(self, user: User) -> Dict[str, Any]:
        """사용자용 액세스 토큰 생성"""
        access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "username": user.username
        }
    
    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """사용자 정보 수정"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        
        # 비밀번호가 포함된 경우 해싱
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user 