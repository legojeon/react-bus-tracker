from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

class BaseService:
    """기본 서비스 클래스"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self) -> List[Any]:
        """모든 데이터 조회"""
        pass
    
    def get_by_id(self, id: int) -> Optional[Any]:
        """ID로 데이터 조회"""
        pass
    
    def create(self, data: Dict[str, Any]) -> Any:
        """데이터 생성"""
        pass
    
    def update(self, id: int, data: Dict[str, Any]) -> Optional[Any]:
        """데이터 수정"""
        pass
    
    def delete(self, id: int) -> bool:
        """데이터 삭제"""
        pass 