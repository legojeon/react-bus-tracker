# 🚌 Bus Info - 버스 정보 시스템

버스 정류소 검색, 실시간 도착 정보 조회, 즐겨찾기 기능을 제공하는 웹 애플리케이션입니다.

## 🌟 주요 기능

### 🗺️ 지도 기반 검색
- **네이버 지도 API**를 활용한 인터랙티브 지도
- 현재 위치 기반 주변 정류소 검색
- 정류소 클릭으로 상세 정보 조회

### 🚏 실시간 버스 정보
- **공공데이터 포털 API**를 통한 실시간 도착 정보
- 정류소별 경유 버스 노선 조회
- 도착 예정 시간 및 남은 정류장 수 표시

### ⭐ 즐겨찾기 기능
- 자주 이용하는 정류소 즐겨찾기 등록/해제
- 즐겨찾기 목록에서 빠른 접근
- 사용자별 개인화된 정류소 관리

### 🔐 사용자 인증
- 회원가입 및 로그인 기능
- JWT 토큰 기반 인증
- 사용자별 즐겨찾기 데이터 관리

## 🏗️ 기술 스택

### Frontend
- **React 19** - 사용자 인터페이스
- **Vite** - 빌드 도구 및 개발 서버
- **Material-UI (MUI)** - UI 컴포넌트 라이브러리
- **React Router** - 클라이언트 사이드 라우팅

### Backend
- **FastAPI** - Python 웹 프레임워크
- **SQLAlchemy** - ORM 및 데이터베이스 관리
- **SQLite** - 경량 데이터베이스
- **JWT** - 사용자 인증
- **Pydantic** - 데이터 검증

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 오케스트레이션

### External APIs
- **네이버 지도 API** - 지도 서비스
- **공공데이터 포털 API** - 버스 정보

## 📁 프로젝트 구조

```
bus_info/
├── 📁 backend/                    # 백엔드 애플리케이션
│   ├── 📁 app/
│   │   ├── 📁 controllers/       # API 컨트롤러
│   │   ├── 📁 database/          # 데이터베이스 설정
│   │   ├── 📁 models/            # 데이터 모델
│   │   ├── 📁 routes/            # API 라우터
│   │   ├── 📁 schemas/           # Pydantic 스키마
│   │   ├── 📁 services/          # 비즈니스 로직
│   │   └── 📁 utils/             # 유틸리티 함수
│   ├── 📄 main.py                # FastAPI 애플리케이션
│   ├── 📄 requirements.txt       # Python 의존성
│   ├── 📄 config.py              # 설정 파일
│   └── 📄 app.db                 # SQLite 데이터베이스
├── 📁 frontend/                   # 프론트엔드 애플리케이션
│   ├── 📁 src/
│   │   ├── 📁 features/          # 기능별 컴포넌트
│   │   │   ├── 📁 home/          # 홈 페이지
│   │   │   ├── 📁 login/         # 로그인 페이지
│   │   │   ├── 📁 register/      # 회원가입 페이지
│   │   │   ├── 📁 map/           # 지도 페이지
│   │   │   └── 📁 saved/         # 즐겨찾기 페이지
│   │   └── 📁 utils/             # 유틸리티 함수
│   ├── 📄 package.json           # Node.js 의존성
│   └── 📄 vite.config.js         # Vite 설정
├── 📄 Dockerfile                  # Docker 이미지 빌드
├── 📄 docker-compose.yml         # Docker Compose 설정
├── 📄 .gitignore                  # Git 제외 파일
└── 📄 README.md                   # 프로젝트 문서
```

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd bus_info
```

### 2. 환경 변수 설정

#### Backend 환경 변수 (`backend/.env`)
```bash
# 데이터베이스 설정
DATABASE_URL=sqlite:///./app.db

# 서버 설정
API_HOST=0.0.0.0
API_PORT=8000

# JWT 설정
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 애플리케이션 설정
DEBUG=True
ENVIRONMENT=development
LOG_LEVEL=INFO

# 공공데이터 포털 API 키
DECODED_DATA_API_KEY=your-decoded-api-key-here
ENCODED_DATA_API_KEY=your-encoded-api-key-here
```

#### Frontend 환경 변수 (`frontend/.env`)
```bash
# API URL (상대경로 사용)
VITE_API_URL=

# 네이버 지도 API
VITE_NAVER_CLIENT_ID=your-naver-client-id-here
VITE_NAVER_CLIENT_SECRET=your-naver-client-secret-here

# 애플리케이션 환경
VITE_APP_ENV=development
```

### 3. Docker로 실행
```bash
# 애플리케이션 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

### 4. 접속
- **애플리케이션**: http://localhost:20011

## 🛠️ 개발 환경 설정

### 로컬 개발 (Docker 없이)

#### Backend 설정
```bash
cd backend

# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 애플리케이션 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend 설정
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📚 API 문서

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 정류소 API
- `GET /api/stations/search` - 정류소 검색
- `GET /api/stations/arrival_info` - 실시간 도착 정보
- `GET /api/stations/routes` - 정류소 경유 노선

### 즐겨찾기 API
- `GET /api/saved-routes/list` - 즐겨찾기 목록
- `POST /api/saved-routes/add` - 즐겨찾기 추가
- `DELETE /api/saved-routes/remove` - 즐겨찾기 제거

## 🔧 주요 컴포넌트

### Backend Components

#### Models (`backend/app/models/`)
- `UserModel` - 사용자 정보 관리
- `BusStationModel` - 정류소 정보 관리
- `SavedRouteModel` - 즐겨찾기 관리

#### Services (`backend/app/services/`)
- `UserService` - 사용자 인증 및 관리
- `BusStationService` - 정류소 정보 조회
- `SavedRouteService` - 즐겨찾기 관리

#### Controllers (`backend/app/controllers/`)
- `AuthController` - 인증 관련 로직
- `BusStationController` - 정류소 관련 로직

### Frontend Components

#### Features (`frontend/src/features/`)
- `Home` - 메인 페이지
- `Login` - 로그인 폼
- `Register` - 회원가입 폼
- `Map` - 지도 및 정류소 검색
- `Saved` - 즐겨찾기 관리

## 🐳 Docker 설정

### 단일 컨테이너 아키텍처
- **Multi-stage Dockerfile**: 프론트엔드 빌드 → 백엔드 실행
- **정적 파일 서빙**: FastAPI가 React 빌드 결과물 서빙
- **상대경로 API**: 프론트엔드에서 백엔드 API 호출

### 볼륨 마운트
- `./backend/app.db:/app/app.db` - 데이터베이스 파일 동기화
- 환경 변수는 `.env` 파일에서 로드

## 🔍 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :20011

# Docker 컨테이너 재시작
docker-compose restart
```

#### 2. 데이터베이스 접근 오류
```bash
# 데이터베이스 파일 권한 확인
ls -la backend/app.db

# 컨테이너 내부 확인
docker-compose exec app ls -la /app/app.db
```

#### 3. API 키 오류
- `.env` 파일의 API 키가 올바른지 확인
- 네이버 지도 API의 도메인 등록 확인

#### 4. 빌드 오류
```bash
# 캐시 삭제 후 재빌드
docker-compose down
docker system prune -f
docker-compose up -d --build
```

## 📝 개발 가이드

### 코드 스타일
- **Python**: PEP 8 준수
- **JavaScript**: ESLint 규칙 준수
- **React**: 함수형 컴포넌트 사용

### 새로운 기능 추가
1. Backend: Model → Service → Controller → Router 순서로 구현
2. Frontend: Feature 폴더에 컴포넌트 추가
3. API 문서 업데이트

### 테스트
```bash
# Backend 테스트
cd backend
python -m pytest

# Frontend 테스트
cd frontend
npm test
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Bus Info** - 버스 정보를 더 쉽고 편리하게 🚌✨ 
