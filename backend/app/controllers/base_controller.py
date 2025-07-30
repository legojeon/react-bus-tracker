from fastapi import HTTPException
from typing import Any, Dict, List, Optional

class BaseController:
    """기본 컨트롤러 클래스"""
    
    def __init__(self):
        pass
    
    def handle_error(self, error: Exception, status_code: int = 500) -> HTTPException:
        """에러 처리 메서드"""
        return HTTPException(status_code=status_code, detail=str(error))
    
    def validate_data(self, data: Any) -> bool:
        """데이터 검증 메서드"""
        return True 