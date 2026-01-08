# SHAREPLZ 프로젝트 개발 노하우 (Know-how)

이 문서는 SHAREPLZ 프로젝트를 개발하고 유지보수하며 얻은 기술적 경험과 의사결정 내역을 기록합니다.

## 1. 프로젝트 구조 및 아키텍처
- **모노레포 구조**: server/ (Cloudflare Workers + Durable Objects)와 webapp/ (Next.js + Cloudflare Pages)으로 분리.
- **백엔드/프론트엔드 통신**:
  - 실시간 데이터: WebSocket을 통해 Durable Objects와 직접 통신.
  - 관리 작업(방 삭제 등): Webapp API Route에서 Server Worker의 HTTP 엔드포인트를 호출하여 DO 제어.

## 2. Cloudflare 서비스 연동
- **D1 Database**: SQLite 기반의 지속적 저장소. DO의 데이터를 디바운싱(Debouncing)하여 비동기적으로 백업.
- **Durable Objects (DO)**:
  - ctx.storage를 사용하여 인메모리 데이터를 영속화.
  - ctx.blockConcurrencyWhile을 통해 초기 데이터 로드 시 안전성 확보.

## 3. 실시간 협업 및 동시성 제어
- **편집 잠금 (Exclusive Lock)**:
  - 동시 편집 충돌 방지를 위해 한 사용자에게만 편집 권한 부여.
  - 3초간 입력이 없거나 연결이 끊기면 자동으로 잠금 해제.
  - userId를 생성하여 본인이 소유한 잠금인지 판별.

## 4. 프론트엔드 개발 가이드
- **권한 관리**: 6자리 PIN 번호를 사용하며, 인증 성공 시 sessionStorage에 저장하여 새로고침 시에도 유지.
- **반응형 디자인**: tailwind v4를 활용하며, 아주 작은 화면(xs: 480px) 대응을 위해 @theme에 브레이크포인트 추가.
- **UI 미학**: 다크 모드 중심, JetBrains Mono 폰트, 터미널 스타일 레이아웃, 60-30-10 법칙 준수.

## 5. 운영 및 배포
- **패키지 관리**: pnpm 사용 필수.
- **배포 명령**:
  - 서버: cd server && pnpm run deploy
  - 웹앱: cd webapp && pnpm pages:deploy

## 6. 코드 스타일 및 규칙
- **한글 주석**: 주요 로직에 한글 주석 작성 필수.
- **코드 크기 제한**: 파일당 80줄 이내 유지 지향. 초과 시 로직 분리.
