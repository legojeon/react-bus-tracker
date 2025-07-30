# Bus Info - Docker 설정

이 프로젝트는 Docker를 사용하여 백엔드와 프론트엔드를 하나의 컨테이너로 실행할 수 있습니다.

## 📋 요구사항

- Docker
- Docker Compose

## 🚀 빠른 시작

### 전체 애플리케이션 실행

```bash
# 애플리케이션 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 🌐 접속 URL

- **애플리케이션**: http://localhost:20011
- **프론트엔드**: http://localhost:20011 (정적 파일로 서빙)
- **API 엔드포인트**: http://localhost:20011/api/
- **헬스체크**: http://localhost:20011/health

## 🔧 환경 변수 설정

프로덕션 환경에서는 다음 환경 변수들을 적절히 설정해야 합니다:

### 백엔드 환경 변수
```bash
DATABASE_URL=sqlite:///data/app.db
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
ENVIRONMENT=production
LOG_LEVEL=INFO
DECODED_DATA_API_KEY=your-decoded-api-key-here
ENCODED_DATA_API_KEY=your-encoded-api-key-here
```

### 프론트엔드 환경 변수
```bash
# API URL을 비워두면 상대경로 사용
VITE_API_URL=
VITE_NAVER_CLIENT_ID=your-naver-client-id-here
```

## 📁 파일 구조

```
bus_info/
├── Dockerfile                    # 전체 애플리케이션 Dockerfile
├── .dockerignore                 # Docker 빌드 시 제외할 파일들
├── docker-compose.yml           # Docker Compose 설정
├── backend/                     # 백엔드 코드
├── frontend/                    # 프론트엔드 코드
└── README_Docker.md            # 이 파일
```

## 🛠️ 빌드 및 실행 명령어

### 이미지 빌드
```bash
# 애플리케이션 이미지 빌드
docker build -t bus-info-app .
```

### 컨테이너 실행
```bash
# 애플리케이션 컨테이너 실행
docker run -p 20011:8000 bus-info-app
```

## 🔍 로그 확인

```bash
# 애플리케이션 로그 확인
docker-compose logs

# 실시간 로그 확인
docker-compose logs -f
```

## 🛑 서비스 중지

```bash
# 애플리케이션 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v

# 이미지까지 삭제
docker-compose down --rmi all
```

## 🔄 서비스 재시작

```bash
# 애플리케이션 재시작
docker-compose restart
```

## 🧹 정리

```bash
# 사용하지 않는 컨테이너, 네트워크, 이미지 삭제
docker system prune

# 볼륨까지 삭제
docker system prune -a --volumes
```

## 🐛 문제 해결

### 1. 포트 충돌
포트가 이미 사용 중인 경우:
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :20011

# 해당 프로세스 종료
kill -9 <PID>
```

### 2. 권한 문제
```bash
# Docker 그룹에 사용자 추가
sudo usermod -aG docker $USER

# 재로그인 후 다시 시도
```

### 3. 환경 변수 문제
`.env` 파일을 생성하여 환경 변수를 설정하세요:
```bash
# backend/.env 파일 생성
cp backend/.env.example backend/.env
# 환경 변수 수정
```

## 📝 추가 설정

### PostgreSQL 사용 (선택사항)
PostgreSQL을 사용하려면 `docker-compose.yml`에서 주석 처리된 부분을 활성화하세요:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: bus_info_db
  environment:
    - POSTGRES_DB=bus_info
    - POSTGRES_USER=bus_user
    - POSTGRES_PASSWORD=bus_password
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
  restart: unless-stopped
```

그리고 `DATABASE_URL`을 PostgreSQL로 변경:
```bash
DATABASE_URL=postgresql://bus_user:bus_password@postgres:5432/bus_info
```

## 🚀 프로덕션 배포

프로덕션 환경에서는 다음 사항들을 고려하세요:

1. **보안**: `SECRET_KEY`를 강력한 값으로 변경
2. **HTTPS**: SSL 인증서 설정
3. **로깅**: 로그 수집 및 모니터링 설정
4. **백업**: 데이터베이스 백업 전략 수립
5. **스케일링**: 로드 밸런서 및 오토스케일링 설정 