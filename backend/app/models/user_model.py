from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class User(BaseModel):
    """사용자 모델"""
    
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # 관계 설정
    saved_routes = relationship("SavedRoute", back_populates="user", cascade="all, delete-orphan") 