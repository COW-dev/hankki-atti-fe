<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

이 파일은 AI 에이전트(Claude, Codex 등)가 이 레포지토리에서 작업할 때 따라야 할 규칙과 컨텍스트를 정의합니다.
위의 Next.js 블록은 `next dev`가 자동으로 넣는 것이니 지우지 않는다.

---

## 프로젝트 개요

**한끼아띠 프론트엔드 (사용자 앱)** — 명지대학교 장애학생지원센터·장애학생 서포터즈 "아띠"와 협업하는 장애학생 식사 도우미 매칭 서비스.

장애학생이 학식당 식사 도움이 필요한 시간을 신청하면, 도우미 학생이 선착순으로 지원해 매칭되는 교내 웹 서비스다. 사용자 대부분이 장애학생이므로 **접근성은 기능 요구사항과 같은 무게**로 다룬다.

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19 |
| 언어 | TypeScript (strict) |
| 스타일 | Tailwind CSS v4 + 디자인 토큰(CSS 변수) |
| 글꼴 | Pretendard (dynamic subset) |
| 테스트 | Vitest + Testing Library (jsdom) |
| 린트·포맷 | ESLint 9 (eslint-config-next), Prettier |
| 패키지 관리 | pnpm 11 |
| 백엔드 | `hankki-atti-be` (Spring Boot) — API 명세는 백엔드 Swagger UI |

**사용자와 화면**

| 사용자 | 화면 | 크기 모드 |
|---|---|---|
| 비로그인 | 소개, 로그인, 회원가입, 비밀번호 재설정 | L |
| 장애학생 | 도우미 신청, 내 신청, 공지사항, 마이페이지 (모바일 웹, 계정은 센터가 발급) | L |
| 도우미 | 요청 목록, 매칭 현황, 공지사항, 마이페이지 (모바일 웹, 직접 회원가입) | M |
| 관리자 | 데스크톱 별도 도메인 — **이 레포에 둘지 미정**, 정해지면 이 섹션을 갱신한다 | admin |

**요구사항·디자인 원본**

| 무엇 | 어디 |
|---|---|
| 기능 명세 | Notion "장애학생지원센터 서비스 > 문서" (PRD, 기능명세서, 유저플로우). 명세와 코드가 다르면 기능명세서가 기준 |
| 화면 디자인 | Figma 파일 `xc4O5yRWg6RXjpPGEUcbrE` — **"10 목업"(201:2)이 최신**. 이전 페이지(와이어프레임 등)는 참고만 |
| 디자인 시스템 | Figma "06 디자인 시스템"(68:2) → 코드 정리본은 [docs/design-system.md](docs/design-system.md) |
| 접근성 규칙 | Figma "00 가이드"의 A11Y 공통 규칙(31:2), "05 접근성 주석"(대표 화면 포커스·읽기 순서) |
| API | 백엔드 Swagger UI. 응답 형식은 `ApiResult` (`resultType`, `httpStatusCode`, `code`, `message`, `data`) |

판단이 애매하면 추측하지 말고 사용자에게 확인한다.

---

## 빌드 / 테스트 / 실행 명령어

```bash
pnpm install          # 의존성 설치
pnpm dev              # 로컬 실행 (http://localhost:3000) — 백엔드는 .env.local의 NEXT_PUBLIC_API_BASE_URL (기본 http://localhost:8080)
pnpm lint             # ESLint
pnpm format           # Prettier 적용 (pnpm format:check는 검사만)
pnpm typecheck        # 라우트 타입 생성 후 tsc
pnpm test             # 단위 + Storybook 브라우저 테스트 (Chromium 필요) (pnpm test:watch는 감시 모드)
pnpm build            # 프로덕션 빌드
pnpm storybook        # Storybook (http://localhost:6006)
pnpm build-storybook  # Storybook 정적 빌드
pnpm check            # lint + format:check + typecheck + test — 커밋 전에 돌린다
```

**최초 셋업 (clone 후 1회)**
```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
bash scripts/setup-hooks.sh   # Git 훅 활성화 (main 직접 커밋 차단·시크릿 차단·커밋 메시지 자동 생성)
```
- 로컬에 gitleaks가 없으면 훅은 grep 폴백으로 동작한다 (`brew install gitleaks` 권장)
- 백엔드를 같이 띄우려면 `hankki-atti-be`에서 `./gradlew bootRun` (Docker Desktop 필요)

---

## 디렉토리 구조

```text
apps/web/               # Next.js 사용자 앱 (@/ 별칭의 기준)
├── app/                # 라우트·화면 조립
├── components/         # 앱 전용 레이아웃·브랜드·접근성 설정
├── features/           # 도메인별 화면 조각·훅 (requests/ = 내 신청, requests/create/ = 도우미 신청 폼)
├── lib/                # API·인증·도메인 로직 (labels/ = 상태 enum 표시 문구, format/ = 날짜·시각)
└── public/             # 앱 이미지, icons는 packages/icons/svg 심링크
packages/
├── ui/src/             # 공용 UI: 컴포넌트별 구현·스토리·테스트·index
├── tokens/src/         # tokens.css, styles.css(텍스트 스타일·포커스)
└── icons/              # src/Icon, Figma 원본 svg/
.storybook/             # 공용 UI와 앱 컴포넌트의 Storybook
```

- 컴포넌트 파일은 PascalCase(`TextField.tsx`), 훅은 `useXxx.ts`, 그 밖의 모듈은 kebab-case(`error-codes.ts`)
- 테스트는 대상 옆에 `Xxx.test.tsx` / `xxx.test.ts`로 둔다
- 한 도메인에서만 쓰는 컴포넌트·훅이 늘어나면 `apps/web/features/{도메인}/`(예: `features/requests/`)을 만들고, 처음 만들 때 이 섹션에 추가한다
- 경로 별칭은 `@/`(apps/web 루트)만 쓴다. 공용 패키지는 `@hankki/ui`, `@hankki/tokens`, `@hankki/icons`, 패키지 내부는 상대 경로를 쓴다

---

## 디자인 시스템 규칙

개발 시 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)와 [docs/design-system.md](docs/design-system.md)를 함께 참고한다. 구조·의존성은 아키텍처 문서를, 토큰·스타일·크기 모드·컴포넌트·접근성은 디자인 시스템 문서를 따른다.

상세(토큰 표, 컴포넌트 목록과 Figma 노드 ID, 새 컴포넌트 추가 절차)는 [docs/design-system.md](docs/design-system.md).

1. **원시값 금지** — 색·모서리·글자 크기·조작 영역은 `packages/tokens/src/tokens.css`의 용도 토큰만 쓴다. `#hex`, `text-[15px]`, `bg-gray-100` 같은 Tailwind 기본 팔레트 금지
   - 참조 문법: `bg-(--color-bg-muted)`, `text-(--color-text-secondary)`, `gap-(--space-xs)`, `min-h-(--control-height)`
   - 원시 팔레트(`--brand-*`, `--gray-*`)는 tokens.css 안에서만 쓴다
   - 간격은 Figma가 변수(space/*)에 연결한 곳은 토큰, 목업이 숫자로 둔 곳(예: 빈 상태 영역 gap 10)은 같은 값의 Tailwind 숫자 클래스(`gap-2.5`)를 쓴다. 가까운 토큰으로 바꾸지 않는다
2. **글자는 텍스트 스타일 7개만** — `typo-display`, `typo-title`, `typo-body`, `typo-body-strong`, `typo-label`, `typo-caption`, `typo-caption-strong`. `font-bold`·`leading-*`를 따로 붙이지 않는다
3. **크기 모드** — 화면은 `PageShell size="L" | "M"`으로 감싼다 (장애학생·비로그인 L, 도우미 M). 글자·버튼 높이·탭바·아이콘 크기가 모드를 따라 바뀌므로 **px로 높이·글자 크기를 고정하지 않는다**. 접근성 모드 "큰 글씨"는 `<html data-text-size="large">`로 모든 모드를 덮어쓴다
4. **컴포넌트 먼저** — 화면에서 버튼·입력칸·안내를 직접 그리지 않고 `packages/ui/src`를 쓴다. 없으면 Figma 컴포넌트를 보고 `packages/ui/src`에 먼저 만든다. 구현·스토리·테스트는 컴포넌트 폴더에 함께 둔다
5. **Figma가 기준** — 새 화면·컴포넌트는 Figma MCP `get_design_context`(노드 ID)로 값을 확인하고 만든다. 스크린샷 눈대중 금지. 생성 코드는 그대로 붙이지 않고 이 프로젝트 토큰·컴포넌트로 옮긴다
6. **에셋** — 아이콘·이미지는 Figma에서 받은 파일을 `packages/icons/svg/` 또는 `apps/web/public/images/`에 그대로 두고 `Icon`/`img`로 쓴다. 다시 그리거나 경로를 손대지 않는다
7. **목업 개정(2026-10-01) 원칙** — 배경 bg/subtle 위에 흰 블록(`Block`), 민트(brand/200)는 주 버튼과 선택 상태에만, 그림자는 모달·알림 패널만

---

## 접근성 규칙 (KWCAG 2.2)

Figma A11Y 공통 규칙(31:2)을 코드 기준으로 옮겼다. 위반은 기능 버그와 같은 등급으로 본다.

- **구조** — 화면마다 h1 하나(`TopBar` 제목). header / main / nav 랜드마크. 보이는 순서 = 읽는 순서 = 포커스 순서. `lang="ko"`
- **키보드** — 모든 기능을 키보드로. 포커스 표시는 전역 `:focus-visible` 링을 그대로 쓰고 `outline-none`으로 지우지 않는다 (입력칸처럼 컴포넌트가 대체 표시를 그릴 때만 예외). 화면 이동 후 포커스는 새 화면 h1. 칩·필터 묶음은 radiogroup
- **조작 영역** — 버튼·링크·탭은 `--control-height` 이상 (L 48 · M 44 · 큰 글씨 56)
- **이름** — 아이콘만 있는 버튼은 `aria-label`. 장식 아이콘·기호는 `aria-hidden`(`Icon`은 자동). 탭바 현재 탭 `aria-current="page"`. 같은 이름 버튼이 여러 개면 날짜 등을 넣어 구분. 새 창 링크는 "(새 창)"
- **상태·색** — 색만으로 구분하지 않는다 (상태 태그 텍스트 + 아이콘). 본문 대비 4.5:1 이상. 민트(brand/200) 위에 흰 글자 금지
- **폼** — 모든 입력에 label(`TextField`). 규칙·오류는 `aria-describedby`. 못 누르는 버튼은 `disabled` 대신 `Button inactive`(포커스를 받고 이유를 읽어 줌). 비밀번호 붙여넣기 허용
- **aria-live** — assertive(`role="alert"`): 로그인 실패, 폼 오류. polite: 완료 문구, 필터 결과 "N건 표시", 상태 변화, 새 알림(전역 영역 1개)
- **모달** — `role="dialog"` + `aria-modal`, 열리면 제목으로 포커스(파괴적 버튼 자동 포커스 금지), 포커스 가두기, Esc 닫기, 닫히면 연 버튼으로 복귀, 배경 inert
- **접근성 모드** — 토글은 `button` + `aria-pressed`, 이름 "큰 글씨와 음성 읽기". 기기(localStorage)와 계정(서버) 둘 다 저장 — 계정 저장·음성 읽기는 백엔드 설정 API 이후

---

## 코딩 컨벤션

- 들여쓰기 2칸 스페이스, 한 줄 100자, 작은따옴표 — Prettier가 맞춘다 (`pnpm format`)
- `any` 금지, 타입 단언(`as`)은 API 응답 경계에서만
- 컴포넌트는 named export, 라우트(`page.tsx`, `layout.tsx`)만 default export
- `"use client"`는 상태·이벤트·브라우저 API가 필요한 파일에만 붙인다
- 주석은 "왜"와 근거(Figma 노드 ID, 명세 항목)를 적는다. 코드를 그대로 풀어 쓰는 주석은 달지 않는다
- 사용자에게 보이는 문구는 목업 문구 그대로, 해요체. 용어는 "예약"이 아니라 **"신청"**

### API · 인증

- 서버 호출은 `apiRequest`(로그인 전) / `useAuth().authRequest`(로그인 후)만 쓴다. 컴포넌트에서 `fetch` 직접 호출 금지
- 오류 분기는 `message`가 아니라 `ApiError.code`로 한다. 쓰는 code는 `apps/web/lib/api/error-codes.ts`에 추가한다
- access 토큰은 메모리에만 둔다. **localStorage·sessionStorage·쿠키에 토큰을 저장하지 않는다**. refresh 토큰은 백엔드가 주는 HttpOnly 쿠키라 JS에서 다루지 않는다
- refresh는 `refreshOnce()`로만 부른다 — 같은 refresh 토큰을 두 번 쓰면 서버가 탈취로 보고 계정의 토큰을 모두 폐기한다
- 로그인이 필요한 화면은 `useSessionGuard(역할)`로 감싼다. 숨김은 보조일 뿐이고 권한 판단은 서버가 한다

### 도메인 규칙 (화면에서 지킬 것)

- **블라인드는 서버 책임** — 매칭 전 도우미 화면에는 서버가 준 필드만 그린다. 받은 개인정보를 화면에서 숨기는 방식으로 해결하지 않는다 (그런 응답을 받으면 백엔드에 알린다)
- **장애 정보는 민감정보** — 장애 유형·특이사항을 `console`·에러 리포트에 남기지 않는다
- **상태 표시** — API는 enum 코드만 준다. 표시 문구는 프론트가 매핑하고, 매핑 표는 `apps/web/lib/labels/`에 둔다 (`help-request.ts`: 신청 상태 → StatusTag 톤·문구, 도움 유형 문구)
- **시간** — 신청 시각은 30분 단위, 이용 시간 1시간, 모든 시각은 Asia/Seoul 기준으로 표시한다. 서버의 `LocalDateTime` 문자열은 `apps/web/lib/format/datetime.ts`의 `parseLocalDateTime`으로만 읽는다 (`new Date(문자열)`은 브라우저 시간대를 탄다)

---

## 테스트 컨벤션

**작성 의무**: `apps/web/lib/`의 로직, `packages/ui/src`의 동작·접근성 속성을 새로 만들거나 바꾸면 테스트를 함께 쓴다. 화면(`apps/web/app/`)은 로직을 `apps/web/lib/`로 빼서 테스트한다.

| 대상 | 무엇을 검증 | 도구 |
|---|---|---|
| `apps/web/lib/` | 입력·출력, 오류 분기, 재시도·중복 방지 | Vitest (`fetch`는 `vi.stubGlobal`) |
| `packages/ui/src` | 키보드 동작, 역할·이름·aria 속성 | Testing Library + user-event |
| `apps/web/components/layout`, `apps/web/app/` | 필요할 때만 (복잡한 분기가 생기면 로직을 빼서 테스트) | |

**작성 규칙**
- 요소는 역할과 이름으로 찾는다 (`getByRole("button", { name: "로그인" })`). `data-testid`·클래스 선택자는 쓰지 않는다 — 스크린리더가 찾을 수 없으면 테스트도 못 찾아야 한다
- 이름: `describe(대상)` + `it("상황이면 기대 결과")` 한글 문장
- 구조: given-when-then 주석으로 구분 (짧은 테스트는 생략 가능)
- 스냅샷 테스트·assertion 없는 테스트·구현을 그대로 옮긴 테스트 금지

---

## Git 워크플로우

- 브랜치 전략: **GitHub flow** — `main`에서 작업 브랜치를 만들고 PR로 `main`에 병합한다
- 브랜치 네이밍: `feat/기능명`, `fix/버그명`, `refactor/대상`, `chore/작업명`, `docs/대상` — 전부 `main`에서 분기. 앞 PR이 병합되기 전에 그 브랜치 위로 쌓지 않는다
- 커밋 형식: Conventional Commits — `type: 한글 제목 (명사형 종결)`
  | type | 용도 |
  |---|---|
  | `feat` | 새 기능·화면 추가 |
  | `fix` | 버그 수정 |
  | `refactor` | 동작 변경 없는 코드 구조 개선 |
  | `chore` | 빌드/설정/의존성 등 기타 작업 |
  | `docs` | 문서 변경 |
  | `test` | 테스트 추가/수정 |
  | `ci` | CI/CD 워크플로우 변경 |
  | `style` | 포맷팅 등 로직 변경 없는 스타일 수정 |
  ```
  feat: 로그인 화면 추가
  fix: 큰 글씨 모드에서 탭바 글자 잘림 수정
  ```
- 본문은 한글로, 무엇을 바꿨는지보다 **왜** 바꿨는지를 적는다
- **PR 병합 방식**: **Squash and merge** — PR 제목이 곧 `main`의 최종 커밋 메시지가 된다
- **PR 제목 컨벤션**: 커밋 제목과 동일한 형식(`type: 명사형 제목`)
- PR은 `.github/pull_request_template.md` 형식 준수. 화면 변경은 스크린샷(필요하면 큰 글씨 모드 포함)을 붙인다
- PR은 CI(`.github/workflows/ci.yml`의 `check`, `secret-scan`, `agent-config`)가 모두 통과해야 병합할 수 있다

---

## 절대 규칙

다음 행동은 어떤 상황에서도 금지된다.

1. **main 병합은 사람만** — PR 머지는 사용자가 직접 실행, 에이전트는 절대 병합하지 않는다
2. **force push 금지** — `git push --force` 절대 실행 금지
3. **main 직접 커밋/push 금지** — 작업은 항상 작업 브랜치에서 한다 (pre-commit 훅이 로컬에서 차단)
4. **민감정보 커밋 금지** — `.env.local`, API 키, 토큰, 계정 정보 커밋 금지. `NEXT_PUBLIC_*` 변수는 브라우저에 그대로 노출되므로 비밀값을 넣지 않는다
5. **인증 변경 사람 리뷰 필수** — `apps/web/lib/auth/`, `apps/web/lib/api/client.ts`의 토큰·쿠키 처리를 바꾸면 반드시 사람이 리뷰 후 병합
6. **커밋 전 사용자 승인 필수** — 커밋 메시지 제안 후 승인 대기, 자동 커밋 금지

**허용되는 것**
- 작업 브랜치(`feat/*`, `fix/*` 등)로의 push — 커밋이 사용자 승인을 받았다면 허용
- `gh pr create --draft` — draft PR 생성 허용

---

## AI 에이전트 커맨드 워크플로우

커맨드 원본은 `.agents/commands/`에 있다. `.claude/commands/`와 `.codex/commands/`는 이 디렉토리를 가리키는 심링크이므로, **수정은 반드시 `.agents/commands/`에서만** 한다.

아래 명령을 요청하면 `.agents/commands/<command>.md` 파일을 먼저 읽고 해당 절차를 따른다.

| 명령 | 파일 | 용도 |
|---|---|---|
| `/feature` | `.agents/commands/feature.md` | 계획부터 PR 초안까지 전체 기능 워크플로우 |
| `/plan` | `.agents/commands/plan.md` | 구현 전 계획 수립 (Figma 노드·명세 확인 포함) |
| `/impl` | `.agents/commands/impl.md` | 승인된 계획 기반 구현 |
| `/review` | `.agents/commands/review.md` | 변경사항 셀프 리뷰 (디자인 시스템·접근성 체크리스트) |
| `/commit` | `.agents/commands/commit.md` | 커밋 메시지 제안 및 승인 후 커밋 |
| `/pr` | `.agents/commands/pr.md` | PR 설명 초안 작성 및 draft PR 생성 |

**적용 규칙**
- 커맨드 파일 내용이 AGENTS.md와 충돌하면 AGENTS.md를 우선한다.
- 커맨드 파일을 읽었더라도 절대 규칙은 항상 유지한다.
- `/commit`은 커밋 메시지 제안 후 사용자 승인을 받은 경우에만 실행한다.
- `/pr`은 브랜치 push 후 draft PR 생성까지 실행한다. 머지는 하지 않는다.

---

## 핸드오프/상태 문서 컨벤션

에이전트가 작업 인계 문서(핸드오프, 계획, 상태 파일)를 작성할 때:

1. **기준점 기록 필수** — 문서 상단에 작성 시각, 기준 브랜치, HEAD SHA를 적는다
   ```
   > 작성: 2026-10-01 · 브랜치: feat/xxx · 기준 HEAD: abc1234
   ```
2. **완료 처리 규칙 명시** — 문서가 언제 효력을 잃는지, 완료 시 어떻게 처리할지(배너 후 아카이브 또는 삭제) 문서 안에 적는다
3. **완료된 핸드오프는 즉시 닫는다** — 체크리스트가 끝나면 상단에 `✅ 완료 (날짜, 병합 PR)` 배너를 달거나 삭제한다
4. **영구 정보는 이 파일(AGENTS.md)로 이관** — 일회성 문서에 영구 규칙을 남기지 않는다
