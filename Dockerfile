# 멀티스테이지 빌드를 위한 베이스 이미지
FROM node:18-alpine AS frontend-builder

# 프론트엔드 빌드
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# 백엔드 이미지
FROM python:3.11-slim

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# Python 의존성 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 코드 복사
COPY backend/ .

# 프론트엔드 빌드 결과물을 static 폴더에 복사
COPY --from=frontend-builder /app/frontend/dist ./static

# 포트 노출
EXPOSE 8000

# 환경 변수 설정
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 애플리케이션 실행
CMD ["python", "main.py"] 