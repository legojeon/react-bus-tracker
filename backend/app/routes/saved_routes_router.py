from .base_router import BaseRouter
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.saved_route_model import SavedRoute
from app.models.user_model import User
from app.models.bus_station_model import BusStation
from app.utils.auth import get_current_user
from typing import List, Dict, Any, Optional

class SavedRoutesRouter(BaseRouter):
    """즐겨찾기 라우터"""
    
    def __init__(self):
        super().__init__()
        self.setup_routes()
    
    def setup_routes(self):
        """라우트 설정"""
        
        @self.router.post("/save", response_model=Dict[str, Any])
        async def save_route(
            ars_id: str,
            route_number: str,
            route_id: Optional[str] = None,
            db: Session = Depends(get_db),
            authorization: Optional[str] = Header(None)
        ):

            """버스 즐겨찾기 저장"""
            try:
                # 인증 토큰 검증
                if not authorization or not authorization.startswith("Bearer "):
                    raise HTTPException(
                        status_code=401, 
                        detail="로그인이 필요합니다"
                    )
                
                try:
                    from app.utils.auth import verify_token
                    username = verify_token(authorization[7:])
                    if not username:
                        raise HTTPException(
                            status_code=401, 
                            detail="유효하지 않은 토큰입니다"
                        )
                    
                    user = db.query(User).filter(User.username == username).first()
                    if not user:
                        raise HTTPException(
                            status_code=401, 
                            detail="사용자를 찾을 수 없습니다"
                        )
                    
                    user_id = user.id
                    
                except Exception as e:
                    raise HTTPException(
                        status_code=401, 
                        detail="토큰 검증에 실패했습니다"
                    )
                
                # 정류소 존재 확인
                station = db.query(BusStation).filter(BusStation.ars_id == ars_id).first()
                if not station:
                    raise HTTPException(status_code=404, detail="정류소를 찾을 수 없습니다")
                
                # 이미 저장된 즐겨찾기인지 확인
                existing = db.query(SavedRoute).filter(
                    SavedRoute.user_id == user_id,
                    SavedRoute.ars_id == ars_id,
                    SavedRoute.route_number == route_number
                ).first()
                
                if existing:
                    return {"success": True, "message": "이미 즐겨찾기에 저장되어 있습니다"}
                
                # 새로운 즐겨찾기 저장
                saved_route = SavedRoute(
                    user_id=user_id,
                    ars_id=ars_id,
                    route_number=route_number,
                    route_id=route_id if route_id and route_id != 'None' else None
                )
                

                
                db.add(saved_route)
                db.commit()
                
                return {"success": True, "message": "즐겨찾기가 저장되었습니다"}
                
            except HTTPException:
                raise
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")
        
        @self.router.delete("/delete", response_model=Dict[str, Any])
        async def delete_route(
            ars_id: str,
            route_number: str,
            db: Session = Depends(get_db),
            authorization: Optional[str] = Header(None)
        ):
            """버스 즐겨찾기 삭제"""
            try:
                # 인증 토큰 검증
                if not authorization or not authorization.startswith("Bearer "):
                    raise HTTPException(
                        status_code=401, 
                        detail="로그인이 필요합니다"
                    )
                
                try:
                    from app.utils.auth import verify_token
                    username = verify_token(authorization[7:])
                    if not username:
                        raise HTTPException(
                            status_code=401, 
                            detail="유효하지 않은 토큰입니다"
                        )
                    
                    user = db.query(User).filter(User.username == username).first()
                    if not user:
                        raise HTTPException(
                            status_code=401, 
                            detail="사용자를 찾을 수 없습니다"
                        )
                    
                    user_id = user.id
                    
                except Exception as e:
                    raise HTTPException(
                        status_code=401, 
                        detail="토큰 검증에 실패했습니다"
                    )
                
                # 즐겨찾기 찾기
                saved_route = db.query(SavedRoute).filter(
                    SavedRoute.user_id == user_id,
                    SavedRoute.ars_id == ars_id,
                    SavedRoute.route_number == route_number
                ).first()
                
                if not saved_route:
                    return {"success": True, "message": "즐겨찾기가 존재하지 않습니다"}
                
                # 즐겨찾기 삭제
                db.delete(saved_route)
                db.commit()
                
                return {"success": True, "message": "즐겨찾기가 삭제되었습니다"}
                
            except HTTPException:
                raise
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")
        
        @self.router.get("/check", response_model=Dict[str, Any])
        async def check_favorite(
            ars_id: str,
            route_number: str,
            db: Session = Depends(get_db),
            authorization: Optional[str] = Header(None)
        ):
            """특정 버스가 즐겨찾기에 저장되어 있는지 확인"""
            try:
                # 인증 토큰 검증
                if not authorization or not authorization.startswith("Bearer "):
                    raise HTTPException(
                        status_code=401, 
                        detail="로그인이 필요합니다"
                    )
                
                try:
                    from app.utils.auth import verify_token
                    username = verify_token(authorization[7:])
                    if not username:
                        raise HTTPException(
                            status_code=401, 
                            detail="유효하지 않은 토큰입니다"
                        )
                    
                    user = db.query(User).filter(User.username == username).first()
                    if not user:
                        raise HTTPException(
                            status_code=401, 
                            detail="사용자를 찾을 수 없습니다"
                        )
                    
                    user_id = user.id
                    
                except Exception as e:
                    raise HTTPException(
                        status_code=401, 
                        detail="토큰 검증에 실패했습니다"
                    )
                
                saved_route = db.query(SavedRoute).filter(
                    SavedRoute.user_id == user_id,
                    SavedRoute.ars_id == ars_id,
                    SavedRoute.route_number == route_number
                ).first()
                
                return {
                    "success": True,
                    "isFavorite": saved_route is not None
                }
                
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")
        
        @self.router.get("/list", response_model=Dict[str, Any])
        async def get_user_saved_routes(
            db: Session = Depends(get_db),
            authorization: Optional[str] = Header(None)
        ):
            """사용자의 즐겨찾기 목록 조회"""
            try:
                # 인증 토큰 검증
                if not authorization or not authorization.startswith("Bearer "):
                    raise HTTPException(
                        status_code=401, 
                        detail="로그인이 필요합니다"
                    )
                
                try:
                    from app.utils.auth import verify_token
                    username = verify_token(authorization[7:])
                    if not username:
                        raise HTTPException(
                            status_code=401, 
                            detail="유효하지 않은 토큰입니다"
                        )
                    
                    user = db.query(User).filter(User.username == username).first()
                    if not user:
                        raise HTTPException(
                            status_code=401, 
                            detail="사용자를 찾을 수 없습니다"
                        )
                    
                    user_id = user.id
                    
                except Exception as e:
                    raise HTTPException(
                        status_code=401, 
                        detail="토큰 검증에 실패했습니다"
                    )
                
                # 사용자의 즐겨찾기 목록 조회 (정류소 정보와 함께)
                saved_routes = db.query(SavedRoute, BusStation).join(
                    BusStation, SavedRoute.ars_id == BusStation.ars_id
                ).filter(SavedRoute.user_id == user_id).all()
                
                result = []
                for saved_route, station in saved_routes:
                    # 도착정보 가져오기 (서울/경기도 구분)
                    from .bus_station_router import BusStationRouter
                    bus_router = BusStationRouter()
                    arrival_info = bus_router.get_bus_list(saved_route.ars_id, db)
                    
                    # 해당 버스의 도착정보 찾기 (route_id로 매칭)
                    matched_bus = None
                    if saved_route.route_id:
                        matched_bus = next((bus for bus in arrival_info if bus.get('busRouteId') == saved_route.route_id), None)
                    
                    result.append({
                        "arsId": saved_route.ars_id,
                        "routeNumber": saved_route.route_number,
                        "stationName": station.station_name,
                        "longitude": station.longitude,
                        "latitude": station.latitude,
                        "arrmsg1": matched_bus['arrmsg1'] if matched_bus else "정보 없음",
                        "arrmsg2": matched_bus['arrmsg2'] if matched_bus else "",
                        "direction": matched_bus['direction'] if matched_bus else ""
                    })
                
                return {
                    "success": True,
                    "savedRoutes": result
                }
                
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")
