# SHAREPLZ

> **개발자를 위한 실시간 협업 기반 텍스트 공유 플랫폼**
>
> [https://shareplz.qus0in.dev](https://shareplz.qus0in.dev)

SHAREPLZ는 개발자가 협업 과정에서 코드나 로그 등을 실시간으로 빠르게 공유하기 위해 제작된 플랫폼입니다. 복잡한 회원가입 없이 즉시 방을 만들어 협업하고 효율적으로 텍스트를 전달할 수 있습니다.

![Preview](/webapp/public/preview.png)

## 주요 기능

- **실시간 동기화 및 편집 잠금**:
  - Cloudflare Durable Objects와 WebSockets를 기반으로 즉각적인 업데이트를 제공합니다.
  - **편집 잠금(Exclusive Lock)**: 동시 편집으로 인한 데이터 충돌을 방지하기 위해 한 번에 한 명만 편집할 수 있는 잠금 매커니즘이 작동합니다. (3초간 활동이 없으면 자동 해제)
- **세밀한 권한 제어**:

  - **편집자 역할**: 콘텐츠 수정 및 **방 삭제**를 위해 6자리 PIN 번호가 필요합니다.
  - **뷰어 역할**: 모든 사람에게 공개하거나 별도의 읽기 전용 PIN으로 보호할 수 있습니다.
- **휘발성 및 보안**:
  - 콘텐츠는 자동 백업 기능이 있는 Cloudflare D1에 저장됩니다.
  - 회원가입이 필요 없는 익명 사용을 지향합니다.
  - 세션 기반의 인증 방식을 사용합니다.
- **개발자 중심의 UI**:
  - 다크 모드 및 **모바일 반응형 디자인** 지원.
  - 주석(`\#`, `//`) 구문 강조(Syntax Highlighting).
  - 자동 URL 링크 생성 (주석이 아닌 텍스트 내에서만 클릭 가능).
  - 원클릭 "전체 복사" 및 "공유 링크" 기능.
  - 터미널 스타일의 미학적 디자인.

## 기술 스택

### 프론트엔드 (Webapp)
- **Framework**: Next.js 15 (App Router, Edge Runtime)
- **Styling**: Tailwind CSS v4
- **Deployment**: Cloudflare Pages
- **State Management**: Custom Hooks (`useRoom`, `useAuth`)
- **Key Libraries**: `lucide-react`, `sonner`

### 백엔드 (Server)
- **Runtime**: Cloudflare Workers
- **Coordination**: Cloudflare Durable Objects (WebSocket & 상태 관리)
- **Database**: Cloudflare D1 (SQLite 기반)
- **Language**: TypeScript

## 프로젝트 구조

본 프로젝트는 서버와 웹 애플리케이션을 모두 포함하는 모노레포 구조입니다.

```
shareplz/
├── server/       # Cloudflare Worker & Durable Object 로직
│   ├── src/
│   └── wrangler.toml
└── webapp/       # Next.js 프론트엔드
    ├── src/
    │   ├── app/      # App Router 페이지
    │   ├── components/
    │   ├── hooks/    # 커스텀 로직
    │   └── lib/      # 유틸리티
    └── wrangler.toml
```

## 작동 방식

1. **방 생성**: 사용자가 편집/읽기 PIN(선택 사항)을 설정하여 방을 생성합니다.
2. **연결**: 클라이언트는 WebSocket을 통해 특정 Durable Object 인스턴스에 연결됩니다.
3. **동기화 및 잠금**: 에디터에서 입력하면 즉시 Durable Object로 업데이트가 전송되며, 동시 편집 시 한 한 명에게만 잠금이 부여되어 충돌을 방지합니다.
4. **영속성**: Durable Object는 업데이트를 디바운싱(Debouncing)하여 최신 콘텐츠를 Cloudflare D1 데이터베이스에 비동기적으로 저장합니다.
5. **방 삭제**: 편집자가 방을 삭제하면 D1 데이터베이스에서 레코드가 삭제되고, Server Worker를 통해 Durable Object의 상태(스토리지)가 모두 초기화되며 연결된 소켓이 종료됩니다.


## 라이선스

MIT 라이선스. [@qus0in](https://github.com/qus0in) 제작.
