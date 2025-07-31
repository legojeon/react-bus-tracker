# 🚌 언제와 - 버스 정보 시스템

매일 같은 버스를 타는 사람들이 매번 출발·도착을 검색할 필요 없이, 자주 타는 정류소와 노선을 즐겨찾기해 한 번에 확인할 수 있는 버스 도착 정보 서비스입니다.

서비스 바로가기: [bus.coco.io.kr](http://bus.coco.io.kr)

---

## 🌟 주요 기능

### 🗺️ 지도 기반 검색
- **네이버 지도 API**를 활용한 인터랙티브 지도
- 정류소 클릭으로 버스 도착 정보 조회
- 좌표 기반 주변 정류소 검색

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
- JWT 토큰 기반 인증 및 세션 관리
- 사용자별 즐겨찾기 데이터 관리

---

## 🖼️ 실행 화면

<p align="center">
  <strong>전체 과정</strong><br/>
  <img src="https://github.com/legojeon/react-bus-tracker/blob/main/screen_shot/process.gif?raw=true" alt="전체 과정" width="400"/><br/>
  <em>전체적인 서비스의 흐름</em>
</p>


<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>홈 화면</strong><br/>
      <img src="https://github.com/legojeon/react-bus-tracker/blob/main/screen_shot/main.png?raw=true" alt="홈 화면" width="300"/><br/>
      <em>원하는 서비스를 선택</em>
    </td>
    <td align="center" width="50%">
      <strong>검색 화면</strong><br/>
      <img src="https://github.com/legojeon/react-bus-tracker/blob/main/screen_shot/home1.png?raw=true" alt="검색 화면" width="300"/><br/>
      <em>주로 이용하는 정류소를 검색</em>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>검색 결과</strong><br/>
      <img src="https://github.com/legojeon/react-bus-tracker/blob/main/screen_shot/search1.png?raw=true" alt="검색 결과" width="300"/><br/>
      <em>정류소의 버스 노선을 확인하고 즐겨찾기에 등록</em>
    </td>
    <td align="center" width="50%">
      <strong>즐겨찾기 탭</strong><br/>
      <img src="https://github.com/legojeon/react-bus-tracker/blob/main/screen_shot/saved_list.png?raw=true" alt="즐겨찾기 탭" width="300"/><br/>
      <em>즐겨찾기한 정류소,버스를 한눈에 확인</em>
    </td>
  </tr>
</table>


## 🌍 외부 API & 데이터

이 프로젝트는 여러 외부 API와 데이터를 활용하여 실시간 버스 정보를 제공하며, 버스정류소 위치를 지도에서 표시합니다. 아래는 사용되는 주요 외부 API와 관련 데이터입니다.

### 🚌 서울시 및 경기도 버스정류소 API : 정류소,노선 데이터 및 실시간 도착정보 제공
- **서울특별시 정류소 정보 조회 API**: [서울특별시 정류소 정보 조회 서비스](https://www.data.go.kr/data/15000303/openapi.do)  
- **경기도 버스 도착 정보 API**: [경기도 버스도착정보 조회](https://www.data.go.kr/data/15080346/openapi.do)  
  
### 🗺️ 서울시 및 경기도 버스정류소 데이터 : 모든 버스종류소의 위치 정보 및 데이터 제공
- **서울시 버스정류소 위치 정보**: [서울시 버스정류소 위치정보](https://data.seoul.go.kr/dataList/OA-15067/S/1/datasetView.do)  
- **경기도 버스정류소 현황 데이터**: [경기도 버스정류소 현황](https://data.gg.go.kr/portal/data/service/selectServicePage.do?infId=GDKWAGWYRKJYIRVX110226832213&infSeq=1)  

### 🗺️ 네이버 지도 API
- **API 문서**: [네이버 맵 API](https://navermaps.github.io/maps.js.ncp/)  
  네이버 지도 API를 사용하여 버스정류소의 위치를 지도에 표시하고, 사용자가 지도 상에서 정류소를 쉽게 찾을 수 있도록 합니다.

### 활용 방식
- **버스정류소 데이터**: 서울시와 경기도의 버스정류소 데이터를 활용하여 각 지역의 버스정류소 위치를 지도에 표시합니다.
- **버스 도착 정보 API**: 각 정류소에 대해 공공 API를 통해 실시간 버스 도착 정보를 조회하여 사용자에게 해당 버스의 예상 도착 시간 및 경유 노선을 제공합니다.

이 외부 API와 데이터 소스를 통해 실시간 버스 정보와 정류소 위치를 정확하게 조회할 수 있습니다.

---
## 🛠 기술 스택

### Frontend
- **React 19** - 사용자 인터페이스
- **Vite** - 빌드 도구 및 개발 서버
- **Material-UI (MUI)** - UI 컴포넌트 라이브러리
- **React Router** - 클라이언트 사이드 라우팅

### Backend
- **FastAPI** - Python 웹 프레임워크
- **SQLAlchemy** - ORM 및 데이터베이스 관리
- **SQLite** - 경량 데이터베이스
- **JWT** - JSON Web Token을 사용하여 사용자 인증 처리
- **Pydantic** - 데이터 검증

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 오케스트레이션

### External APIs
- **네이버 지도 API** - 지도 서비스
- **공공데이터 포털 API** - 버스 정보

---

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


## ⚡ TL;DR — 빠른 실행 가이드
```bash
# 1. 저장소 클론
git clone <repository-url>
cd bus_info

# 2. Docker 실행
docker-compose up -d --build
```

## 🚀 실행 방법

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

---

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

---

## 🔧 주요 컴포넌트

### Backend Components

### MVC 구조
이 프로젝트는 MVC (Model-View-Controller) 구조를 기반으로 설계되었습니다. MVC 패턴은 애플리케이션의 데이터를 관리하는 Model, 사용자와 상호작용하는 View, 그리고 비즈니스 로직을 처리하는 Controller로 나뉘어 코드의 유지보수성과 확장성을 높이는 구조입니다.
- Model: 애플리케이션의 데이터를 관리하고, 데이터베이스와의 상호작용을 처리합니다.
- View: 사용자 인터페이스를 나타내며, 사용자가 보는 화면을 구성합니다.
- Controller: 사용자의 입력을 처리하고, 적절한 Model과 View를 연결하여 비즈니스 로직을 수행합니다.


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

---

**Bus Info** - 버스 정보를 더 쉽고 편리하게 🚌✨ 
