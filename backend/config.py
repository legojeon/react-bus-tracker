import os
from dotenv import load_dotenv
from typing import Optional
from pathlib import Path

# .env 파일 로드 (backend/.env에서 명시적으로)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')

class Settings:
    """애플리케이션 설정 클래스"""
    
    # 데이터베이스 설정
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # API 설정
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # 보안 설정
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # 외부 API 키
    DECODED_DATA_API_KEY: Optional[str] = os.getenv("DECODED_DATA_API_KEY")
    ENCODED_DATA_API_KEY: Optional[str] = os.getenv("ENCODED_DATA_API_KEY")
    
    # 개발 환경 설정
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # 로깅 설정
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate_api_keys(cls) -> dict:
        """API 키 유효성 검사"""
        missing_keys = []
        available_keys = {}
        
        # 필요한 API 키들 체크
        api_keys = {
            "DECODED_DATA_API_KEY": cls.DECODED_DATA_API_KEY,
            "ENCODED_DATA_API_KEY": cls.ENCODED_DATA_API_KEY,
        }
        
        for key_name, key_value in api_keys.items():
            if key_value and key_value != "your-decoded-api-key-here" and key_value != "your-encoded-api-key-here":
                available_keys[key_name] = "✓ 설정됨"
            else:
                missing_keys.append(key_name)
                available_keys[key_name] = "✗ 설정되지 않음"
        
        return {
            "available_keys": available_keys,
            "missing_keys": missing_keys,
            "total_configured": len(api_keys) - len(missing_keys),
            "total_required": len(api_keys)
        }

# 전역 설정 인스턴스
settings = Settings() 