from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class SavedRoute(BaseModel):
    """즐겨찾기 버스 모델"""
    
    __tablename__ = "saved_routes"
    
    # 외래 키
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ars_id = Column(String(50), nullable=False)
    route_number = Column(String(20), nullable=False)
    route_id = Column(String(50), nullable=True)  # 버스 노선 ID
    
    # 관계 설정
    user = relationship("User", back_populates="saved_routes")
    
    # 복합 유니크 제약조건 (사용자별로 같은 정류소의 같은 버스는 중복 불가)
    __table_args__ = (
        UniqueConstraint('user_id', 'ars_id', 'route_number', name='unique_user_route'),
    ) 