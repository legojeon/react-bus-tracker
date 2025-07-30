from fastapi import APIRouter, Depends, HTTPException
from typing import Any, Dict, List

class BaseRouter:
    """기본 라우터 클래스"""
    
    def __init__(self):
        self.router = APIRouter()
    
    def setup_routes(self):
        """라우트 설정"""
        pass
    
    def get_router(self) -> APIRouter:
        """라우터 반환"""
        return self.router 