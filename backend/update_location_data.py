#!/usr/bin/env python3
"""
기존 bus_stations 데이터의 location 필드를 "SEL"로 업데이트하는 스크립트
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import settings

def update_location_data():
    """기존 데이터의 location을 "SEL"로 업데이트"""
    try:
        # 데이터베이스 연결
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.begin() as connection:
            print("🔍 데이터베이스 연결 성공")
            
            # 1. location 컬럼 존재 확인
            result = connection.execute(text("""
                SELECT name FROM pragma_table_info('bus_stations') 
                WHERE name = 'location'
            """))
            
            if not result.fetchone():
                print("❌ location 컬럼이 존재하지 않습니다. 먼저 컬럼을 추가해주세요.")
                return False
            
            # 2. 현재 location 값 확인
            result = connection.execute(text("""
                SELECT location, COUNT(*) as count 
                FROM bus_stations 
                GROUP BY location
            """))
            
            print("📊 현재 location 값 분포:")
            for row in result:
                print(f"   - {row[0] or 'NULL'}: {row[1]}개")
            
            # 3. NULL이거나 빈 값인 데이터를 "SEL"로 업데이트
            print("\n🔄 location 데이터 업데이트 중...")
            result = connection.execute(text("""
                UPDATE bus_stations 
                SET location = 'SEL' 
                WHERE location IS NULL OR location = '' OR location != 'SEL'
            """))
            
            updated_rows = result.rowcount
            print(f"✅ {updated_rows}개의 행이 업데이트되었습니다.")
            
            # 4. 업데이트 후 결과 확인
            result = connection.execute(text("""
                SELECT location, COUNT(*) as count 
                FROM bus_stations 
                GROUP BY location
            """))
            
            print("\n📊 업데이트 후 location 값 분포:")
            for row in result:
                print(f"   - {row[0]}: {row[1]}개")
            
            # 5. 전체 행 수 확인
            result = connection.execute(text("SELECT COUNT(*) FROM bus_stations"))
            total_rows = result.fetchone()[0]
            print(f"\n📊 총 {total_rows}개의 정류소 데이터가 있습니다.")
            
            return True
            
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return False

def verify_update():
    """업데이트 결과 확인"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as connection:
            # location이 "SEL"인 행 수 확인
            result = connection.execute(text("""
                SELECT COUNT(*) FROM bus_stations 
                WHERE location = 'SEL'
            """))
            
            sel_count = result.fetchone()[0]
            
            # 전체 행 수 확인
            result = connection.execute(text("SELECT COUNT(*) FROM bus_stations"))
            total_count = result.fetchone()[0]
            
            print(f"\n🔍 검증 결과:")
            print(f"   - location이 'SEL'인 행: {sel_count}개")
            print(f"   - 전체 행 수: {total_count}개")
            
            if sel_count == total_count:
                print("🎉 모든 정류소가 성공적으로 'SEL'로 설정되었습니다!")
                return True
            else:
                print(f"⚠️  일부 정류소({total_count - sel_count}개)가 'SEL'로 설정되지 않았습니다.")
                return False
            
    except Exception as e:
        print(f"❌ 확인 중 오류 발생: {str(e)}")
        return False

def main():
    """메인 함수"""
    print("🚌 버스 정류소 location 데이터 업데이트 시작")
    print("=" * 50)
    
    # 업데이트 실행
    if update_location_data():
        print("\n🔍 업데이트 결과 확인 중...")
        verify_update()
    else:
        print("❌ 업데이트에 실패했습니다.")
        sys.exit(1)
    
    print("\n✅ 업데이트가 완료되었습니다!")

if __name__ == "__main__":
    main() 