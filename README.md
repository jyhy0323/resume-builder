# 🚀 AI Resume & Portfolio Builder

> 사용자의 경력과 프로젝트 경험을 바탕으로 **Google Gemini AI**가 최적화된 이력서(Resume)와 포트폴리오(Portfolio) 초안을 3초 만에 생성해 주는 풀스택 웹 애플리케이션입니다.

---

## 📌 프로젝트 소개

- **개발 목적**: 취업 및 이직 준비생들이 자신의 경험을 정리하면, AI가 채용 담당자의 시선을 사로잡는 고품질의 이력서와 포트폴리오 문서로 자동 변환해 줍니다.
- **UI 콘셉트**: 평온하고 싱그러운 **비취색(Jade) 톤과 커리어 성장을 상징하는 나무 일러스트** 적용
- **핵심 특징**:
  - **Prompt A (일반 모드)**: 누구나 읽기 편하고 균형 잡힌 표준 이력서 형식
  - **Prompt B (전문가 모드)**: STAR 기법(Situation, Task, Action, Result)과 정량적 성과 지표를 극대화한 고성과자 이력서 형식

---

## ✨ 핵심 기능

1. **맞춤형 정보 입력 폼**: 이름, 지원 직무, 어조(Tone), 경력 사항, 프로젝트 경험 입력
2. **이중 모드 프롬프트 엔지니어링**: 일반 모드와 전문가 모드 중 선택하여 결과물 최적화
3. **Google Gemini API 연동**: 최신 `gemini-3.6-flash` 모델을 통한 신속하고 자연스러운 글 생성
4. **실시간 비동기 통신**: `Fetch API`를 활용하여 화면 새로고침 없이 로딩 스피너 및 결과 렌더링
5. **원클릭 클립보드 복사**: 생성된 이력서를 한 번의 클릭으로 클립보드에 복사
6. **마크다운(.md) 파일 다운로드**: 노션(Notion)이나 GitHub `README.md`로 바로 가져갈 수 있는 파일 다운로드
7. **철저한 보안 관리**: 비밀 API Key는 `.env`로 격리하고 `.gitignore`를 통해 Git 추적에서 제외
8. **백엔드 로깅 시스템**: 요청 수신, 응답 완료, 오류 내역을 서버 터미널에 실시간 기록

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
- **Python** (v3.10+)
- **Flask**: 경량 웹 서버 및 REST API 라우팅 (`/`, `/generate`)
- **google-genai**: Google Gemini API 공식 SDK
- **python-dotenv**: 안전한 환경변수(`.env`) 로드

### Frontend
- **HTML5**: 시맨틱 웹 구조 설계
- **CSS3**: 모던하고 깔끔한 카드 레이아웃, 반응형 디자인
- **Vanilla JavaScript (ES6+)**: 비동기 API 통신, DOM 조작, 클립보드 및 Blob 파일 다운로드 제어

### DevOps & Tools
- **Git**: 버전 관리 및 변경 이력 추적
- **PowerShell**: 윈도우 가상환경 관리

---

## 📂 프로젝트 구조

```text
resume-builder/
├── app.py                  # Flask 백엔드 서버 및 Gemini API 연동 로직
├── requirements.txt        # 프로젝트 의존성 라이브러리 목록
├── .env                    # 비밀 API Key 보관 (Git 제외)
├── .env.example            # 환경변수 작성 안내 템플릿
├── .gitignore              # Git 추적 제외 파일 목록
├── README.md               # 프로젝트 설명서 (현재 파일)
├── templates/
│   └── index.html          # 프론트엔드 메인 웹 페이지
└── static/
    ├── css/
    │   └── style.css       # 스타일시트
    └── js/
        └── app.js          # 비동기 통신 및 이벤트 제어 스크립트
```

---

## 🚀 빠른 시작 가이드 (Getting Started)

Windows PowerShell 기준으로 아래 단계를 따라 실행할 수 있습니다.

### 1. 프로젝트 폴더 이동
```powershell
Set-Location -Path "C:\AI-study\resume-builder"
```

### 2. 가상환경 활성화
```powershell
.\venv\Scripts\Activate.ps1
```
*(터미널 프롬프트 앞에 `(venv)`가 나타나는지 확인합니다.)*

### 3. 필수 패키지 설치
```powershell
py -m pip install -r requirements.txt
```

### 4. 환경변수(.env) 설정
`.env.example` 파일을 복사하여 `.env` 파일을 만들고, 본인의 Gemini API 키를 입력합니다.
```env
GEMINI_API_KEY=본인의_실제_API_키_입력
```
*(API 키 발급: [Google AI Studio](https://aistudio.google.com/))*

### 5. 웹 서버 실행
```powershell
py app.py
```

### 6. 브라우저 접속
웹 브라우저를 열고 아래 주소로 접속합니다:
👉 **`http://127.0.0.1:5000`**

---

## 📝 라이선스

이 프로젝트는 학습 및 포트폴리오 용도로 자유롭게 수정하고 활용할 수 있습니다.
