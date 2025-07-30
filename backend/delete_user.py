#!/usr/bin/env python3
"""
사용자 계정 삭제 스크립트
터미널에서 사용자명을 입력받아 해당 사용자와 관련된 모든 데이터를 삭제합니다.
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user_model import User
from app.models.saved_route_model import SavedRoute
from config import settings

def delete_user_by_username(username):
    """사용자명으로 사용자와 관련 데이터 삭제"""
    
    # 데이터베이스 연결
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 사용자 조회
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            print(f"❌ 사용자를 찾을 수 없습니다: {username}")
            return False
        
        print(f"📋 사용자 정보:")
        print(f"   - ID: {user.id}")
        print(f"   - 사용자명: {user.username}")
        print(f"   - 이메일: {user.email}")
        print(f"   - 활성화 상태: {user.is_active}")
        
        # 사용자의 즐겨찾기 데이터 조회
        saved_routes = db.query(SavedRoute).filter(SavedRoute.user_id == user.id).all()
        print(f"   - 즐겨찾기 개수: {len(saved_routes)}개")
        
        # 삭제 확인
        confirm = input(f"\n⚠️  정말로 사용자 '{username}'와 모든 즐겨찾기 데이터를 삭제하시겠습니까? (y/N): ")
        
        if confirm.lower() != 'y':
            print("❌ 삭제가 취소되었습니다.")
            return False
        
        # 즐겨찾기 데이터 삭제
        if saved_routes:
            print(f"🗑️  즐겨찾기 데이터 {len(saved_routes)}개 삭제 중...")
            for route in saved_routes:
                db.delete(route)
        
        # 사용자 삭제
        print(f"🗑️  사용자 '{username}' 삭제 중...")
        db.delete(user)
        
        # 변경사항 저장
        db.commit()
        
        print(f"✅ 사용자 '{username}'와 관련 데이터가 성공적으로 삭제되었습니다.")
        return True
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        db.rollback()
        return False
    
    finally:
        db.close()

def main():
    """메인 함수"""
    print("🚌 사용자 계정 삭제 스크립트")
    print("=" * 50)
    
    if len(sys.argv) != 2:
        print("사용법: python delete_user.py <사용자명>")
        print("예시: python delete_user.py testuser")
        sys.exit(1)
    
    username = sys.argv[1]
    
    if not username.strip():
        print("❌ 사용자명을 입력해주세요.")
        sys.exit(1)
    
    print(f"🔍 사용자 '{username}' 검색 중...")
    
    # 사용자 삭제 실행
    success = delete_user_by_username(username)
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main() 