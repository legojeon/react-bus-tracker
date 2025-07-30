from sqlalchemy import Column, String, Float, Integer
from .base_model import BaseModel

class BusStation(BaseModel):
    """버스 정류소 모델"""
    
    __tablename__ = "bus_stations"
    
    # ars_id를 기본 키로 사용하되, id도 유지
    ars_id = Column(String(10), unique=True, nullable=False, index=True)
    station_name = Column(String(100), nullable=False, index=True)
    longitude = Column(Float, nullable=False)  # tmX -> longitude
    latitude = Column(Float, nullable=False)   # tmY -> latitude
    location = Column(String(50), nullable=True, default="SEL")  # 위치 정보 (서울: SEL) 