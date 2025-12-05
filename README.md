# bokdeok2-fe

Vue.js 3 + Vite로 구축된 프론트엔드 프로젝트입니다.

## 기술 스택

- **Vue.js 3** - 프론트엔드 프레임워크
- **Vite** - 빌드 도구 및 개발 서버
- **Composition API** - Vue 3의 최신 API 사용

## 시작하기

### 다른 PC에서 프로젝트 받기

다른 PC에서 이 프로젝트를 clone 받은 경우:

1. **프로젝트 클론**
```bash
git clone <repository-url>
cd bokdeok2-fe
```

2. **의존성 설치** (node_modules는 .gitignore에 있어서 자동으로 설치됨)
```bash
npm install
```

3. **환경 변수 설정** (필요한 경우)
```bash
# .env.example 파일을 참고하여 .env 파일 생성
# 또는 환경 변수가 필요없다면 이 단계는 생략 가능
```

4. **개발 서버 실행**
```bash
npm run dev
```

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173` (또는 표시된 포트)로 접속하세요.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 4. 빌드 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```
bokdeok2-fe/
├── src/
│   ├── App.vue          # 루트 컴포넌트
│   ├── main.js          # 앱 진입점
│   └── style.css        # 전역 스타일
├── index.html           # HTML 템플릿
├── vite.config.js       # Vite 설정
└── package.json         # 프로젝트 의존성
```

## 다음 단계

- 컴포넌트 추가 및 구조화
- 라우터 설정 (Vue Router)
- 상태 관리 (Pinia 또는 Vuex)
- API 통신 설정
