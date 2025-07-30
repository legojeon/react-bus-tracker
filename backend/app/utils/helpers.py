import json
from typing import Any, Dict, List
from datetime import datetime

def format_response(success: bool, message: str, data: Any = None) -> Dict[str, Any]:
    """응답 형식화"""
    return {
        "success": success,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }

def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> bool:
    """필수 필드 검증"""
    for field in required_fields:
        if field not in data or data[field] is None:
            return False
    return True

def sanitize_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """데이터 정제"""
    return {k: v for k, v in data.items() if v is not None} 