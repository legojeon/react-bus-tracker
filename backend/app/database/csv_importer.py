import csv
import os
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from .connection import SessionLocal, engine
from ..models.bus_station_model import BusStation
from ..models.saved_route_model import SavedRoute
from ..models.base_model import Base

def import_bus_stations_from_csv(csv_file_path: str, location: str = "SEL"):
    """CSV 파일에서 버스 정류소 데이터를 읽어서 데이터베이스에 입력"""
    
    # 데이터베이스 테이블 생성 (이미 존재하면 무시됨)
    # BusStation과 SavedRoute 테이블 모두 생성
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 기존 데이터 확인
        existing_count = db.query(BusStation).count()
        print(f"기존 버스 정류소 데이터: {existing_count}개")
        
        if existing_count > 0:
            print("이미 데이터가 존재합니다. 덮어쓰시겠습니까? (y/n): ", end="")
            response = input().lower().strip()
            if response != 'y':
                print("데이터 입력을 취소했습니다.")
                return
            # 기존 데이터 삭제
            db.query(BusStation).delete()
            db.commit()
            print("기존 데이터를 삭제했습니다.")
        
        # CSV 파일 읽기
        if not os.path.exists(csv_file_path):
            print(f"CSV 파일을 찾을 수 없습니다: {csv_file_path}")
            return
        
        print(f"CSV 파일을 읽는 중: {csv_file_path}")
        print(f"지역 설정: {location}")
        
        imported_count = 0
        with open(csv_file_path, 'r', encoding='euc-kr') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                try:
                    # CSV 컬럼명에 따라 데이터 추출 (서울과 경기도 컬럼명이 다름)
                    if location == "SEL":
                        # 서울 CSV 컬럼명
                        ars_id = row.get('arsId', '').strip()
                        station_name = row.get('stNm', '').strip()
                        tm_x = row.get('tmX', '').strip()
                        tm_y = row.get('tmY', '').strip()
                    else:
                        # 경기도 CSV 컬럼명
                        ars_id = row.get('정류소id', '').strip()
                        station_name = row.get('정류소명', '').strip()
                        tm_x = row.get('WGS84경도', '').strip()
                        tm_y = row.get('WGS84위도', '').strip()
                    
                    # 필수 데이터 검증
                    if not all([ars_id, station_name, tm_x, tm_y]):
                        print(f"필수 데이터 누락: ars_id={ars_id}, station_name={station_name}, tm_x={tm_x}, tm_y={tm_y}")
                        continue
                    
                    # 좌표를 float로 변환
                    try:
                        longitude = float(tm_x)
                        latitude = float(tm_y)
                    except ValueError:
                        print(f"좌표 변환 실패: tm_x={tm_x}, tm_y={tm_y}")
                        continue
                    
                    # BusStation 객체 생성
                    bus_station = BusStation(
                        ars_id=ars_id,
                        station_name=station_name,
                        longitude=longitude,
                        latitude=latitude,
                        location=location
                    )
                    
                    db.add(bus_station)
                    imported_count += 1
                    
                    # 1000개마다 커밋 (메모리 효율성)
                    if imported_count % 1000 == 0:
                        db.commit()
                        print(f"진행 상황: {imported_count}개 처리됨")
                
                except Exception as e:
                    print(f"행 처리 중 오류 발생: {row}, 오류: {e}")
                    continue
        
        # 최종 커밋
        db.commit()
        print(f"버스 정류소 데이터 입력 완료: {imported_count}개")
        
        # 최종 확인
        final_count = db.query(BusStation).count()
        print(f"데이터베이스에 저장된 버스 정류소: {final_count}개")
        
        # saved_routes 테이블 생성 확인
        saved_routes_count = db.query(SavedRoute).count()
        print(f"saved_routes 테이블 생성 완료 (현재 데이터: {saved_routes_count}개)")
        
    except Exception as e:
        print(f"데이터 입력 중 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

def import_all_bus_stations():
    """서울과 경기도 버스 정류소 데이터를 모두 입력"""
    
    # 데이터베이스 테이블 생성
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 기존 데이터 확인
        existing_count = db.query(BusStation).count()
        print(f"기존 버스 정류소 데이터: {existing_count}개")
        
        if existing_count > 0:
            print("이미 데이터가 존재합니다. 덮어쓰시겠습니까? (y/n): ", end="")
            response = input().lower().strip()
            if response != 'y':
                print("데이터 입력을 취소했습니다.")
                return
            # 기존 데이터 삭제
            db.query(BusStation).delete()
            db.commit()
            print("기존 데이터를 삭제했습니다.")
        
        backend_dir = Path(__file__).resolve().parent.parent.parent
        
        # 서울 데이터 입력
        seoul_csv_path = backend_dir / "seoul_bus_station.csv"
        if os.path.exists(seoul_csv_path):
            print("\n🚌 서울 버스 정류소 데이터 입력 시작...")
            import_bus_stations_from_csv(str(seoul_csv_path), "SEL")
        else:
            print(f"⚠️  서울 CSV 파일을 찾을 수 없습니다: {seoul_csv_path}")
        
        # 경기도 데이터 입력 (기존 데이터 유지하면서 추가)
        kyg_csv_path = backend_dir / "kyg_bus_station.csv"
        if os.path.exists(kyg_csv_path):
            print("\n🚌 경기도 버스 정류소 데이터 입력 시작...")
            import_kyg_bus_stations_from_csv(str(kyg_csv_path))
        else:
            print(f"⚠️  경기도 CSV 파일을 찾을 수 없습니다: {kyg_csv_path}")
        
        # 최종 통계
        total_count = db.query(BusStation).count()
        location_stats = db.query(BusStation.location, func.count(BusStation.id)).group_by(BusStation.location).all()
        
        print(f"\n📊 최종 통계:")
        print(f"   - 전체 정류소: {total_count}개")
        for location, count in location_stats:
            location_name = {"SEL": "서울", "KYG": "경기도"}.get(location, location)
            print(f"   - {location_name}: {count}개")
        
    except Exception as e:
        print(f"데이터 입력 중 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

def import_kyg_bus_stations_from_csv(csv_file_path: str):
    """경기도 CSV 파일에서 버스 정류소 데이터를 읽어서 데이터베이스에 입력"""
    
    db = SessionLocal()
    try:
        print(f"경기도 CSV 파일을 읽는 중: {csv_file_path}")
        
        imported_count = 0
        skipped_count = 0
        
        with open(csv_file_path, 'r', encoding='euc-kr') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                try:
                    # CSV 컬럼명에 따라 데이터 추출
                    ars_id = row.get('정류소id', '').strip()
                    station_name = row.get('정류소명', '').strip()
                    latitude = row.get('WGS84위도', '').strip()
                    longitude = row.get('WGS84경도', '').strip()
                    
                    # 필수 데이터 검증
                    if not all([ars_id, station_name, latitude, longitude]):
                        print(f"필수 데이터 누락: 정류소id={ars_id}, 정류소명={station_name}, WGS84위도={latitude}, WGS84경도={longitude}")
                        skipped_count += 1
                        continue
                    
                    # 좌표를 float로 변환
                    try:
                        lat = float(latitude)
                        lon = float(longitude)
                    except ValueError:
                        print(f"좌표 변환 실패: WGS84위도={latitude}, WGS84경도={longitude}")
                        skipped_count += 1
                        continue
                    
                    # 기존에 같은 ars_id가 있는지 확인 (서울 데이터와 중복 방지)
                    existing_station = db.query(BusStation).filter(BusStation.ars_id == ars_id).first()
                    if existing_station:
                        print(f"중복된 정류소 ID 발견: {ars_id} ({station_name}) - 건너뜀")
                        skipped_count += 1
                        continue
                    
                    # BusStation 객체 생성 (경기도는 "KYG"로 설정)
                    bus_station = BusStation(
                        ars_id=ars_id,
                        station_name=station_name,
                        longitude=lon,
                        latitude=lat,
                        location="KYG"  # 경기도 버스 정류소는 "KYG"로 설정
                    )
                    
                    db.add(bus_station)
                    imported_count += 1
                    
                    # 1000개마다 커밋 (메모리 효율성)
                    if imported_count % 1000 == 0:
                        db.commit()
                        print(f"진행 상황: {imported_count}개 처리됨")
                
                except Exception as e:
                    print(f"행 처리 중 오류 발생: {row}, 오류: {e}")
                    skipped_count += 1
                    continue
        
        # 최종 커밋
        db.commit()
        print(f"경기도 버스 정류소 데이터 입력 완료: {imported_count}개")
        print(f"건너뛴 데이터: {skipped_count}개")
        
    except Exception as e:
        print(f"데이터 입력 중 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚌 버스 정류소 데이터 입력 도구")
    print("=" * 50)
    print("1. 서울 데이터만 입력")
    print("2. 경기도 데이터만 입력")
    print("3. 서울 + 경기도 데이터 모두 입력")
    print("4. 종료")
    
    choice = input("\n선택하세요 (1-4): ").strip()
    
    backend_dir = Path(__file__).resolve().parent.parent.parent
    
    if choice == "1":
        # 서울 데이터만 입력
        csv_file_path = backend_dir / "seoul_bus_station.csv"
        print("\n서울 버스 정류소 데이터를 데이터베이스에 입력합니다...")
        import_bus_stations_from_csv(str(csv_file_path), "SEL")
        
    elif choice == "2":
        # 경기도 데이터만 입력
        csv_file_path = backend_dir / "kyg_bus_station.csv"
        print("\n경기도 버스 정류소 데이터를 데이터베이스에 입력합니다...")
        import_kyg_bus_stations_from_csv(str(csv_file_path))
        
    elif choice == "3":
        # 서울 + 경기도 데이터 모두 입력
        print("\n서울과 경기도 버스 정류소 데이터를 모두 입력합니다...")
        import_all_bus_stations()
        
    elif choice == "4":
        print("종료합니다.")
        
    else:
        print("잘못된 선택입니다.")
    
    print("\n✅ 작업이 완료되었습니다.") 