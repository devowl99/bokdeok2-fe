# 테스트 가이드

## 테스트 전 확인 사항

### 1. 백엔드 서버 실행
```bash
# bokducke 폴더에서
./gradlew bootRun
# 또는
gradlew.bat bootRun  # Windows
```

**확인**: `http://localhost:8080` 접속 가능해야 함
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2. 데이터베이스 연결 확인
- MySQL 서버 실행 중이어야 함
- `application.yml`의 DB 설정 확인
  - URL: `jdbc:mysql://localhost:3306/bokduck`
  - Username: `root`
  - Password: `1234`

### 3. 프론트엔드 개발 서버 실행
```bash
# bokdeok2-fe 폴더에서
npm install  # 처음 실행 시
npm run dev
```

**확인**: `http://localhost:5173` 접속 가능해야 함

---

## 테스트 시나리오

### ✅ 1. 회원가입
- 경로: `/register`
- 테스트 데이터:
  - 닉네임: `테스트유저`
  - 이메일: `test@bokdeok.com`
  - 비밀번호: `password123`

**예상 결과**: 회원가입 성공 → 로그인 페이지로 이동

### ✅ 2. 로그인
- 경로: `/login`
- 위에서 생성한 계정으로 로그인

**예상 결과**: 
- 로그인 성공
- JWT 토큰이 localStorage에 저장됨
- 홈 페이지로 이동

**브라우저 콘솔 확인**:
```javascript
localStorage.getItem('accessToken')  // 토큰 확인
localStorage.getItem('user')          // 사용자 정보 확인
```

### ✅ 3. 매물 목록 조회
- 경로: `/map`
- 매물 리스트가 표시되어야 함

**확인 사항**:
- 콘솔에 `[API Request] GET /houses` 로그 확인
- 매물 카드들이 표시되는지 확인

### ✅ 4. 매물 상세 조회
- 매물 카드 클릭 또는 `/estate/{aptSeq}` 접속

**확인 사항**:
- 매물 상세 정보 표시
- 거래 내역 정보 표시 (있는 경우)

### ✅ 5. 스크랩 기능
- 로그인 후 매물 카드의 하트 아이콘 클릭

**확인 사항**:
- 스크랩 상태 변경
- `/scrap` 페이지에서 스크랩한 매물 확인
- 콘솔에 `[API Request] POST /houses/{aptSeq}/scrap` 로그 확인

### ✅ 6. 프로필 조회/수정
- 경로: `/mypage`
- 프로필 정보 확인
- `/mypage/edit`에서 닉네임/비밀번호 수정

### ✅ 7. LLM 채팅
- 지도 페이지에서 "AI 검색" 버튼 클릭
- 채팅창에서 질문 입력

**확인 사항**:
- AI 응답이 표시되는지 확인
- 콘솔에 `[API Request] POST /llm` 로그 확인

---

## 주의사항 및 알려진 이슈

### ⚠️ 1. CORS 에러
**증상**: 브라우저 콘솔에 CORS 에러 발생

**해결**:
- 백엔드에 CORS 설정 추가 필요 (백엔드 개발자와 협의)
- 또는 프록시를 통해서만 접근하도록 확인

### ⚠️ 2. 스크랩 API의 userId 파라미터
**현재 상태**: 
- 스크랩 API는 쿼리 파라미터로 `userId`를 받도록 구현됨
- JWT 토큰에서 자동 추출하도록 백엔드 수정 권장

**임시 해결**:
- 프론트엔드에서 `userId`를 쿼리 파라미터로 전송하도록 구현됨
- 정상 작동하지만 보안상 백엔드 수정 필요

### ⚠️ 3. 데이터 형식 차이
**매물 데이터**:
- 백엔드: `aptSeq` (문자열)
- 프론트엔드: `id` (숫자 또는 문자열)
- 변환 로직이 `estateMapper.js`에 구현되어 있음

**가격 정보**:
- 백엔드: 거래 내역(`HouseDealDto`)에서 추출
- 프론트엔드: `{ purchase: number }` 또는 `{ deposit: number, monthly: number }`
- 거래 내역이 없으면 기본값 사용

### ⚠️ 4. JWT 토큰 만료
**처리**:
- 401 에러 시 자동으로 로그아웃 처리
- "로그인이 만료되었습니다" 알림 표시

### ⚠️ 5. API 응답 형식
**현재 구현**:
- 백엔드는 직접 DTO 반환
- 프론트엔드는 `{ success: true, data: {...} }` 형식 기대
- **해결**: `api/index.js`의 인터셉터에서 자동 변환

**문자열 응답**:
- 일부 API(LLM, 회원가입 등)는 문자열 반환
- 인터셉터에서 자동으로 `{ success: true, data: "..." }` 형식으로 변환

---

## 디버깅 팁

### 1. 브라우저 콘솔 확인
모든 API 요청/응답이 콘솔에 로그로 출력됨:
```
[API Request] GET /houses
[API Error] 404 { message: "Not Found" }
```

### 2. Network 탭 확인
- 브라우저 개발자 도구 → Network 탭
- API 요청의 상태 코드, 요청/응답 데이터 확인

### 3. localStorage 확인
```javascript
// 브라우저 콘솔에서
localStorage.getItem('accessToken')  // JWT 토큰
localStorage.getItem('user')          // 사용자 정보
```

### 4. 백엔드 로그 확인
- Spring Boot 콘솔에서 에러 로그 확인
- MyBatis 쿼리 로그 확인 (application.yml에서 DEBUG 레벨 설정 시)

---

## 다음 단계 (백엔드 수정 권장)

### 1. CORS 설정
백엔드 `SecurityConfig.java` 또는 별도 `CorsConfig.java`에 추가:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 2. 스크랩 API userId 추출
JWT 토큰에서 `userId`를 자동 추출하도록 수정:
- `HouseController.java`의 스크랩 관련 메서드 수정
- `@AuthenticationPrincipal` 또는 JWT 파싱을 통한 userId 추출

### 3. 공통 응답 형식 (선택)
모든 API 응답을 통일된 형식으로 반환:
```java
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
}
```

---

## 문제 발생 시

1. **백엔드 서버가 응답하지 않음**
   - 백엔드 서버 실행 상태 확인
   - 포트 8080이 사용 중인지 확인

2. **404 에러**
   - API 경로 확인 (백엔드 컨트롤러의 `@RequestMapping` 확인)
   - 프록시 설정 확인 (`vite.config.js`)

3. **401 에러 (Unauthorized)**
   - JWT 토큰 확인
   - 백엔드 JWT 검증 로직 확인

4. **500 에러 (Internal Server Error)**
   - 백엔드 로그 확인
   - 데이터베이스 연결 확인
   - SQL 쿼리 오류 확인

---

## 테스트 체크리스트

- [ ] 백엔드 서버 실행 중 (`localhost:8080`)
- [ ] 프론트엔드 개발 서버 실행 중 (`localhost:5173`)
- [ ] 데이터베이스 연결 확인
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 매물 목록 조회 테스트
- [ ] 매물 상세 조회 테스트
- [ ] 스크랩 추가/삭제 테스트
- [ ] 스크랩 목록 조회 테스트
- [ ] 프로필 조회 테스트
- [ ] 프로필 수정 테스트
- [ ] LLM 채팅 테스트

