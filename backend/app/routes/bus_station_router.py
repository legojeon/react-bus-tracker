from .base_router import BaseRouter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.bus_station_model import BusStation
from typing import List
from math import radians, cos, sin, asin, sqrt
import requests
import re
import os
from dotenv import load_dotenv
import ssl

load_dotenv()

class BusStationRouter(BaseRouter):
    """버스 정류소 라우터"""
    
    def __init__(self):
        super().__init__()
        self.API_KEY = os.getenv("DECODED_DATA_API_KEY")
        self.setup_routes()
    
    def haversine(self, lat1, lon1, lat2, lon2):
        """거리 계산 (Haversine 공식)"""
        R = 6371000  # 지구 반지름 (단위: m)
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        return R * c
    
    def get_arrival_info_by_ars_id(self, ars_id):
        """정류소ID -> 정류소 도착 노선ID, 이름,노선유형, 도착정보"""
        url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid'
        params = {
            'serviceKey': self.API_KEY,
            'arsId': ars_id,
            'resultType': 'json'
        }

        response = requests.get(url, params=params)
        result = []

        if response.status_code == 200:
            try:
                data = response.json()
                item_list = data['msgBody'].get('itemList', [])

                if isinstance(item_list, dict):
                    item_list = [item_list]
                for item in item_list:
                    result.append({
                        'busRouteId': item['busRouteId'],
                        'rtNm': item['rtNm'],
                        'arrmsg1': item['arrmsg1'],
                        'arrmsg2': item['arrmsg2'],
                        'direction': item['adirection']
                    })

            except Exception as e:
                print("⚠️ JSON 파싱 오류:", e)
        else:
            print("❌ 요청 실패:", response.status_code)

        return result

    def get_routes_by_station(self, ars_id):
        """정류소ID -> 지나는 모든 버스 노선 id,이름,첫차,막차,유형등"""
        url = 'http://ws.bus.go.kr/api/rest/stationinfo/getRouteByStation'
        params = {
            'serviceKey': self.API_KEY,
            'arsId': ars_id,
            'resultType': 'json'
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            try:
                data = response.json()
                item_list = data.get('msgBody', {}).get('itemList', [])
                
                # None인 경우 빈 리스트로 처리
                if item_list is None:
                    item_list = []

                # 하나만 올 경우 dict → list
                if isinstance(item_list, dict):
                    item_list = [item_list]

                return item_list
            except Exception as e:
                print(f"⚠️ API 응답 파싱 오류: {e}")
                return []
        else:
            print(f"❌ API 요청 실패: {response.status_code}")
            return []

    def get_bus_list_sel(self, ars_id):
        """정류소 지나는 모든 버스노선 (기존 로직)"""
        routes = self.get_routes_by_station(ars_id)  # 전체 노선 목록
        arrivals = self.get_arrival_info_by_ars_id(ars_id)  # 실시간 도착정보

        # routes가 None이면 빈 리스트로 처리
        if routes is None:
            routes = []

        # 도착 정보를 dict 형태로 매핑
        arrival_map = {a['busRouteId']: a for a in arrivals}

        result = []
        for r in routes:
            route_id = r['busRouteId']
            bus = {
                'busRouteId': route_id,
                'rtNm': r['busRouteNm'],
                'routeType': r['busRouteType'],
                'arrmsg1': '',
                'arrmsg2': '',
                'direction': '',
                'arsId': ars_id 
            }

            if route_id in arrival_map:
                bus['arrmsg1'] = arrival_map[route_id]['arrmsg1']
                bus['arrmsg2'] = arrival_map[route_id]['arrmsg2']
                bus['direction'] = arrival_map[route_id]['direction']
            else:
                bus['arrmsg1'] = '도착 정보 없음'
                bus['arrmsg2'] = ''
                bus['direction'] = ''

            result.append(bus)
        return result

    def get_bus_list_kyg(self, station_id, service_key=None, format_type='json'):
        """경기도 버스 정류소 도착 정보 조회"""
        if not service_key:
            service_key = self.API_KEY

        
        url = 'https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalListv2'
        params = {
            'serviceKey': service_key,
            'stationId': station_id,
            'format': format_type
        }

        result = []

        try:
            # 경기도 API는 SSL 문제가 있으므로 HTTP로 시도
            http_url = url.replace('https://', 'http://')
            
            # 세션 생성 및 SSL 설정
            session = requests.Session()
            session.verify = False
            
            # 헤더 추가
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/xml, */*',
                'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache'
            }
            
            response = session.get(http_url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # 경기도 API 응답 구조에 맞게 파싱
                    if 'response' in data and 'msgBody' in data['response']:
                        msg_body = data['response']['msgBody']
                        
                        if 'busArrivalList' in msg_body:
                            items = msg_body['busArrivalList']
                            
                            if isinstance(items, dict):
                                items = [items]
                            
                            for item in items:
                                
                                # predictTimeSec1을 분:초 형식으로 변환
                                predict_time_sec1 = item.get('predictTimeSec1', 0)
                                predict_time_sec2 = item.get('predictTimeSec2', 0)
                                location_no1 = item.get('locationNo1', 0)
                                location_no2 = item.get('locationNo2', 0)
                                
                                # 빈 문자열이나 None 값을 0으로 변환
                                if predict_time_sec1 == '' or predict_time_sec1 is None:
                                    predict_time_sec1 = 0
                                if predict_time_sec2 == '' or predict_time_sec2 is None:
                                    predict_time_sec2 = 0
                                if location_no1 == '' or location_no1 is None:
                                    location_no1 = 0
                                if location_no2 == '' or location_no2 is None:
                                    location_no2 = 0
                                
                                # 초를 분:초 형식으로 변환
                                def format_time(seconds):
                                    if seconds <= 0:
                                        return "정보 없음"
                                    elif seconds <= 60:  # 1분 이하
                                        return "곧 도착"
                                    minutes = seconds // 60
                                    remaining_seconds = seconds % 60
                                    if minutes > 0:
                                        return f"{minutes}분{remaining_seconds}초"
                                    else:
                                        return f"{remaining_seconds}초"
                                
                                # 위치 정보 추가
                                def format_arrival_msg(seconds, location_no):
                                    time_str = format_time(seconds)
                                    if location_no > 0:
                                        return f"{time_str}[{location_no}번째 전]"
                                    else:
                                        return time_str
                                
                                arrmsg1 = format_arrival_msg(predict_time_sec1, location_no1)
                                arrmsg2 = format_arrival_msg(predict_time_sec2, location_no2) if predict_time_sec2 > 0 else ""
                                
                                result.append({
                                    'busRouteId': str(item.get('routeId', '')),
                                    'rtNm': item.get('routeName', ''),
                                    'arrmsg1': arrmsg1,
                                    'arrmsg2': arrmsg2,
                                    'direction': item.get('routeDestName', ''),
                                    'routeType': item.get('routeTypeCd', ''),
                                    'arsId': station_id
                                })
                        else:
                            pass
                    else:
                        pass
                except Exception as e:
                    print(f"⚠️ 경기도 API JSON 파싱 오류: {e}")
            else:
                print(f"❌ 경기도 API 요청 실패: {response.status_code}")

        except Exception as e:
            print(f"❌ 경기도 API 호출 중 오류: {e}")

        return result

    def get_bus_list(self, ars_id, db: Session = None):
        """정류소 지나는 모든 버스노선 (DB location 확인 후 분기)"""
        # DB에서 해당 정류소의 location 정보 확인
        if db:
            station = db.query(BusStation).filter(BusStation.ars_id == ars_id).first()
            if station and station.location == 'SEL':
                # location이 'SEL'인 경우 서울 버스 로직 사용
                return self.get_bus_list_sel(ars_id)
            elif station and station.location == 'KYG':
                # location이 'KYG'인 경우 경기도 버스 로직 사용
                return self.get_bus_list_kyg(ars_id)
        
        # 기본 로직 (location이 'SEL'이 아니거나 DB 정보가 없는 경우)
        return self.get_bus_list_sel(ars_id)
    
    def parse_arrival_time(self, msg):
        """도착시간 기준 정렬"""
        if "곧 도착" in msg:
            return 0
        match = re.search(r"(\d+)분(\d+)초", msg)
        if match:
            minutes = int(match.group(1))
            seconds = int(match.group(2))
            return minutes * 60 + seconds
        elif "분" in msg:  # "3분후" 같은 메시지
            minutes = int(re.search(r"(\d+)분", msg).group(1))
            return minutes * 60
        elif "초" in msg:  # "20초후" 같은 메시지
            seconds = int(re.search(r"(\d+)초", msg).group(1))
            return seconds
        else:
            return 99999  # 도착 정보 없음 또는 운행 종료 등
    
    def setup_routes(self):
        """라우트 설정"""
        
        @self.router.get("/search")
        async def search_station(name: str, db: Session = Depends(get_db)):
            """정류소 이름으로 검색"""
            try:
                # LIKE 검색으로 정류소 이름에 검색어가 포함된 정류소들 찾기
                stations = db.query(BusStation).filter(
                    BusStation.station_name.like(f"%{name}%")
                ).all()
                
                if not stations:
                    return {"success": False, "stations": []}
                
                return {
                    "success": True,
                    "stations": [
                        {
                            "stNm": station.station_name,
                            "arsId": station.ars_id,
                            "x": station.longitude,
                            "y": station.latitude
                        }
                        for station in stations
                    ]
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"검색 중 오류 발생: {str(e)}")
        
        @self.router.get("/nearby")
        async def nearby_stations(ars_id: str, x: float, y: float, db: Session = Depends(get_db)):
            """주변 정류소 검색"""
            try:
                # 모든 정류소 가져오기
                all_stations = db.query(BusStation).all()
                nearby = []
                RADIUS_M = 300  # 300m 반경
                
                for station in all_stations:
                    try:
                        # 본인 정류소는 제외
                        if station.ars_id == ars_id:
                            continue
                        
                        # 거리 계산
                        dist = self.haversine(y, x, station.latitude, station.longitude)
                        if dist <= RADIUS_M:
                            nearby.append({
                                "stNm": station.station_name,
                                "arsId": station.ars_id,
                                "x": station.longitude,
                                "y": station.latitude,
                                "distance": round(dist, 3)
                            })
                    except Exception as e:
                        print(f"정류소 {station.ars_id} 거리 계산 오류: {e}")
                        continue
                
                return {"success": True, "stations": nearby}
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"주변 정류소 검색 중 오류 발생: {str(e)}")
        
        @self.router.get("/arrival_info")
        async def arrival_info(ars_id: str, db: Session = Depends(get_db)):
            """정류소의 버스 도착 정보"""
            try:
                arrivals = self.get_bus_list(ars_id, db)
                
                response_buses = []
                for bus in arrivals:
                    response_buses.append({
                        "rtNm": bus["rtNm"],
                        "arrmsg1": bus["arrmsg1"],
                        "arrmsg2": bus["arrmsg2"],
                        "direction": bus["direction"],
                        "arsId": ars_id,
                        "routeType": bus["routeType"],
                        "busRouteId": bus["busRouteId"]
                    })
                
                # 도착 시간 기준으로 정렬 (빠른 순서대로)
                response_buses.sort(
                    key=lambda x: self.parse_arrival_time(x["arrmsg1"])
                )
                
                return {"success": True, "buses": response_buses}

            except Exception as e:
                print(f"❌ /arrival_info 처리 중 오류 발생: {e}")
                raise HTTPException(status_code=500, detail=f"도착 정보 조회 중 오류 발생: {str(e)}") 