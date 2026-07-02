# 앱테크 통합 플랫폼 (프로토타입)

대한민국의 앱테크(리워드 앱) 혜택을 한 곳에서 확인할 수 있는 통합 플랫폼의 웹 프로토타입입니다.
Cloudflare Pages + Pages Functions로 동작하며, 빌드 도구 없이 정적 HTML/CSS/JS로 구성되어 있습니다.

## 주요 기능

- **홈/랭킹**: 카테고리 필터 + 인기·평점·리뷰수 TOP10 랭킹, 앱 카드 그리드
- **앱 혜택 상세**: 카드 클릭 시 모달로 적립 방법, 추천인 안내 확인
- **내 혜택 조회**: 이미 쓰는 앱을 체크하면(로그인 없이 브라우저에 저장) 아직 안 쓰는 앱과 예상 추가 수익을 계산

> ⚠️ 표시되는 예상 수익은 실제 검증되지 않은 샘플(예시) 데이터입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

`http://127.0.0.1:8788` 에서 확인할 수 있습니다.

## 구조

```
functions/            Cloudflare Pages Functions (API)
  _shared/apps-data.ts   앱테크 앱 시드 데이터
  api/apps.ts             GET /api/apps
public/                정적 사이트
  index.html             홈/랭킹
  benefits.html           내 혜택 조회
  css/, js/
```

## 다음 단계 (범위 외)

로그인/회원, 커뮤니티, 쿠폰함, Flutter 모바일 앱, 실데이터(D1) 연동, 실제 제휴 링크.
