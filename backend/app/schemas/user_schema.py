from .base_schema import BaseSchema
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    """사용자 기본 스키마"""
    
    username: str
    email: EmailStr

class UserCreate(UserBase):
    """사용자 생성 스키마"""
    
    password: str

class UserUpdate(BaseModel):
    """사용자 수정 스키마"""
    
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserLogin(BaseModel):
    """로그인 스키마"""
    
    username: str
    password: str

class UserResponse(UserBase, BaseSchema):
    """사용자 응답 스키마"""
    
    id: int
    is_active: bool
    is_superuser: bool

class Token(BaseModel):
    """토큰 스키마"""
    
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """토큰 데이터 스키마"""
    
    username: Optional[str] = None 