# 디자인 시스템

Figma "06 디자인 시스템"(파일 `xc4O5yRWg6RXjpPGEUcbrE`, 페이지 68:2)을 코드 기준으로 정리한 문서다. 값이 다르면 Figma가 기준이고, 이 문서와 `packages/tokens/src/tokens.css`를 함께 고친다.

- 토큰: `packages/tokens/src/tokens.css`
- 텍스트 스타일·포커스 링: `packages/tokens/src/styles.css`
- 컴포넌트: `packages/ui/src/`(공용 UI), `apps/web/components/`(앱 전용)

## 원칙

Figma 디자인 시스템 머리말(72:50)과 2026-10-01 개정(239:150)을 요약했다.

- 무채색 + 강조색 하나, 넉넉한 여백, 큰 제목
- 배경은 bg/subtle(회색), 내용은 흰 블록(bg/default). 모바일은 블록을 좌우 끝까지 붙이고 블록 사이 회색 띠 10px
- 타일·입력칸·안내·보조 버튼은 bg/muted. 구분선은 border/default
- **민트(brand/200 `#A7F3ED`)는 주 버튼과 선택 상태에만** 쓴다. 밝아서 흰 글자를 올릴 수 없다(1.26:1). 항상 검정 글자와 함께 쓴다(13.4:1)
- 브랜드 글자·테두리는 진한 청록(brand/700·600). 누를 때는 brand/300
- 그림자는 모달·알림 패널에만 약하게
- KWCAG 2.2 — 글자 대비 4.5:1, 테두리·아이콘 3:1 이상

## 색

컴포넌트는 아래 **용도 토큰만** 쓴다. 원시 팔레트(`--brand-50`~`900`, `--gray-0`~`900`)는 `tokens.css` 안에서만 참조한다.

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `--color-bg-default` | #ffffff | 블록·카드 |
| `--color-bg-subtle` | #f8f9fa | 화면 배경 |
| `--color-bg-muted` | #f1f3f5 | 입력칸, 보조 버튼, 타일, 안내 |
| `--color-bg-disabled` | #e4e7eb | 비활성 버튼 |
| `--color-bg-button-primary` | #a7f3ed | 주 버튼 |
| `--color-bg-brand-pressed` | #6cdad1 | 주 버튼 눌림 |
| `--color-bg-brand-selected` | #eefcfb | 선택된 칩·타일·토글·사이드바 |
| `--color-bg-brand-strong` | #0c8f84 | 채워진 체크·라디오, 토글 ON, 탭 인디케이터 |
| `--color-bg-brand` / `-subtle` / `-accent` | #37beb2 / #a7f3ed / #a7f3ed | 강조 면 (brand는 아이콘 배경에 쓰지 않는다, 2.29:1) |
| `--color-bg-danger` / `-danger-subtle` | #e5383b / #fff1f1 | 위험 · 오류 안내 |
| `--color-bg-success-subtle` | #edfaf2 | 성공 안내·태그 |
| `--color-bg-warning-subtle` | #fff5e8 | 경고 안내·태그 |
| `--color-bg-overlay` | #000000 | 모달 뒤 (투명도는 컴포넌트에서) |
| `--color-text-primary` | #191d23 | 본문 |
| `--color-text-secondary` | #5f6773 | 보조 글자 (5.7:1) |
| `--color-text-disabled` | #adb4bd | 비활성 글자 |
| `--color-text-brand` | #096d64 | 선택·강조 글자 |
| `--color-text-on-brand` | #191d23 | 민트 위 글자 |
| `--color-text-danger` / `-success` / `-warning` | #b01e24 / #0e6b39 / #a34e00 | 상태 글자 |
| `--color-border-default` | #e4e7eb | 구분선 |
| `--color-border-strong` | #868e99 | 강한 테두리 |
| `--color-border-brand` | #0f857b | 선택 테두리 |
| `--color-border-focus` | #0c8f84 | 포커스 링, 입력칸 포커스 |
| `--color-border-danger` | #e5383b | 입력칸 오류 |
| `--color-icon-*` | primary · secondary · brand · danger · success · warning · inverse | 아이콘 색 (SVG에 이미 칠해져 있으면 그대로 쓴다) |

## 글자

텍스트 스타일 7개만 쓴다. 클래스 하나가 크기·굵기·줄 간격·자간을 모두 정한다.

| 클래스 | Figma 스타일 | 굵기 | 줄 간격 | 자간 |
|---|---|---|---|---|
| `typo-display` | Display | 700 | 1.4 | -1% |
| `typo-title` | Title | 700 | 1.4 | -0.5% |
| `typo-body` | Body | 400 | 1.5 | 0 |
| `typo-body-strong` | Body Strong | 500 | 1.5 | 0 |
| `typo-label` | Label | 700 | 1.3 | 0 |
| `typo-caption` | Caption | 400 | 1.5 | 0 |
| `typo-caption-strong` | Caption Strong | 700 | 1.4 | 0 |

글꼴은 Pretendard다. Figma에는 Pretendard가 없어 Noto Sans KR로 그렸으므로 글자 폭이 목업과 조금 다를 수 있다. 한글 전체 파일은 2MB라 화면에 나온 글자 조각만 받는 dynamic subset을 쓴다.

## 크기 모드

글자 크기·조작 영역은 모드에 따라 바뀐다. 화면은 `PageShell`의 `size`로 모드를 고르고, 접근성 모드 "큰 글씨"는 `<html data-text-size="large">`로 L·M을 덮어쓴다.

| 토큰 | L 장애학생·비로그인 | M 도우미 | 큰 글씨 | admin 관리자 |
|---|---|---|---|---|
| `--font-display` | 24 | 22* | 34* | 24 |
| `--font-title` | 18 | 17 | 26 | 18* |
| `--font-body` | 16 | 15 | 24 | 14 |
| `--font-label` | 16 | 16 | 24 | 14 |
| `--font-caption` | 14 | 13 | 20 | 12 |
| `--control-height` | 48 | 44 | 56 | 40 |
| `--control-height-sm` | 40 | 36 | 48 | 32* |
| `--control-padding-x` | 20 | 16 | 24 | 12 |
| `--tabbar-height` | 64 | 62 | 84 | — |
| `--icon-size` | 24 | 20 | 28 | 18 |

\* 목업 화면 변수로 확인하지 못해 디자인 시스템 설명(72:205 표, 239:150 개정 메모)의 값을 쓴 것. 해당 크기를 처음 쓰는 화면에서 Figma로 확인한다. 72:205 표는 개정 전 값이라 L·M 글자 크기가 목업과 다르다 — **목업 화면의 변수 값이 기준**이다.

## 간격 · 모서리 · 선

간격은 Figma가 변수에 연결한 곳(컴포넌트 안쪽 여백 등)만 토큰을 쓴다. 목업 화면이 변수 없이 숫자로 둔 간격(예: 빈 상태 영역 gap 10, 비밀번호 규칙 목록 gap 6)은 같은 값의 Tailwind 숫자 클래스(`gap-2.5`, `gap-1.5`)로 옮기고, 가까운 토큰으로 바꾸지 않는다.

| 간격 | 값 | | 모서리 | 값 | 쓰임 |
|---|---|---|---|---|---|
| `--space-2xs` | 4 | | `--radius-sm` | 8 | 안내 |
| `--space-xs` | 8 | | `--radius-control` | 10 | 버튼·입력칸 |
| `--space-sm` | 12 (요소 사이) | | `--radius-md` | 12 | |
| `--space-md` | 16 (화면 좌우 여백) | | `--radius-lg` | 16 | 카드 |
| `--space-lg` | 20 (블록·카드 안 여백) | | `--radius-xl` | 20 | 모달 |
| `--space-xl` | 24 | | `--radius-full` | 999 | 칩·태그 |
| `--space-2xl` | 32 | | `--stroke-default` | 1 | |
| `--space-3xl` | 40 | | `--stroke-strong` | 2 | 입력칸 포커스·오류 |

그림자는 모달·알림 패널에만 쓴다: `--shadow-modal` (Figma Shadow/Modal, 0 8 32 rgba(26,28,36,0.16)).

## 포커스

키보드 포커스는 2px 간격 + 3px `--color-border-focus` 링이다(2026-10-01 개정, 흰 배경 대비 3.98:1). 전역 `:focus-visible`이 그리므로 컴포넌트에서 따로 만들지 않는다. 입력칸은 Figma State=Focus대로 안쪽 2px 테두리로 대신 표시한다.

## 컴포넌트

| 컴포넌트 | Figma | 변형 | 코드 | 상태 |
|---|---|---|---|---|
| Button | 68:73 | Primary · Secondary · Tertiary · Danger × Large · Small | `@hankki/ui` (`Button` / `ButtonLink`) (화면 이동은 `ButtonLink`) | ✅ |
| TextField | 70:62 | Default · Focus · Error · Disabled | `@hankki/ui` (`TextField`) — `helper`, `multiline`(textarea), `count`(글자 수·초과 오류) | ✅ (Disabled 미구현) |
| Notice | 70:77 | Info · Success · Error · Warning | `@hankki/ui` (`Notice tone=…`, `ErrorNotice`) — error만 `alert`, `live`면 `status` | ✅ |
| A11yToggle | 70:86 | Pressed true · false | `apps/web/components/ui/A11yToggle` | ✅ (음성 읽기 미구현) |
| Icon | 68:48 | 15종 | `@hankki/icons` (`Icon`) | 🟡 쓴 것만 `packages/icons/svg`에 있음 |
| TopBar | 70:87 · 목업 201:3 | 뒤로 / 로고, 알림, 접근성 토글 | `apps/web/components/layout/TopBar` | ✅ (알림 개수 미구현) |
| TabBar | 70:141 | 장애학생 · 도우미 × Active 1~4 | `apps/web/components/layout/TabBar` | 🟡 장애학생만 |
| Footer | 목업 201:68 | copyright 유무 | `apps/web/components/layout/Footer` | ✅ |
| Logo | 목업 187:51 | large · topbar · footer | `apps/web/components/ui/Logo` | ✅ Figma에서 한 장의 SVG로 내보냄. 포크 손잡이 레이어(187:47, 이미지 추적)는 내보내기에서 빠져 디자이너 확인 필요 |
| StatusTag | 68:92 | 성공 · 진행 · 종료 · 경고 · 오류 · 정보 · 중립 | `@hankki/ui` (`StatusTag tone=…`) | ✅ |
| Chip | 68:99 | Default · Selected · Pressed · Disabled · Focus | `@hankki/ui` (`ChipGroup` radiogroup + `Chip`) — 화살표 이동 = 선택, `columns`로 균등 폭. disabled 칩도 포커스는 받고 `disabledReason`을 읽어 준다 | ✅ |
| OptionTile | 228:180 | Checkbox · Radio × 5상태 (Checkbox 68:108 대체) | `@hankki/ui` (`OptionGroup` fieldset + `OptionTile`) — 진짜 input을 숨기고 label을 타일로. 높이는 `--control-height`(M에서 Figma 44) | ✅ |
| Toggle | 228:193 | Off · On · Disabled · Focus | — | ⬜ |
| InputCompact | 228:206 | Text · Select (관리자 검색·드롭다운) | — | ⬜ |
| RequestCard | 70:142 | 신청 카드 | — | ⬜ |
| Modal | 70:152 | 확인·선택 모달 | `@hankki/ui` (`Modal`) — 네이티브 `dialog.showModal()`, 열리면 제목 포커스, Esc·배경 클릭(`dismissOnBackdrop`) | ✅ |
| SidebarItem | 70:172 | 관리자 사이드바 | — | ⬜ |

Figma 컴포넌트 설명란에 쓰임과 접근성 규칙이 적혀 있다. 만들기 전에 `get_design_context`로 꼭 읽는다.

## 새 컴포넌트 추가 절차

1. Figma MCP `get_design_context`로 컴포넌트 노드(위 표)를 읽는다. 스크린샷, 설명란, 변수를 확인한다
2. 생성 코드의 값을 이 문서의 토큰과 텍스트 스타일로 바꾼다. 생성 코드에 들어 있는 `var(--x, 기본값)`의 기본값과 px 값은 지운다
3. 상태 변형은 props로 받고, Pressed는 `active:`, Focus는 전역 포커스 링, Disabled는 `inactive`(`aria-disabled`)로 처리한다
4. 에셋(SVG)은 `packages/icons/svg/` 또는 `apps/web/public/images/`에 받아 두고 `Icon`/`img`로 쓴다
5. 파일 상단 JSDoc에 Figma 노드 ID를 적는다
6. 역할·이름·aria 속성·키보드 동작을 테스트한다 (`Xxx.test.tsx`)와 기존 상태별 Storybook 스토리(`Xxx.stories.tsx`)
7. 이 문서의 컴포넌트 표 상태를 바꾼다

## 구조와 Storybook

개발 시 [ARCHITECTURE.md](ARCHITECTURE.md)와 이 문서를 함께 참고한다. `pnpm storybook`으로 공용 UI와 앱 전용 컴포넌트를 확인하고, 스토리는 구현 옆에 둔다. 앱과 Storybook은 동일한 소스·토큰·Pretendard를 사용한다. 툴바에서 L·M 및 큰 글씨를 고른다. 미구현 변형은 스토리를 위해 새로 만들지 않는다.

- 공용 Block은 `packages/ui/src/Block`에 있다. PageShell과 센터·브랜드 정보 및 기기 설정에 묶인 컴포넌트는 앱에 둔다.
- 토큰·텍스트 스타일·포커스는 `@hankki/tokens/styles.css`를 가져온다. Tailwind 진입점은 패키지 소스를 명시적으로 탐색해야 한다.
- 아이콘 원본은 `packages/icons/svg` 한곳에서 관리한다. `apps/web/public/icons` 심링크로 앱과 Storybook 모두 `/icons/*.svg`를 제공한다.
- `pnpm test`는 기존 단위 테스트와 Storybook 상호작용·접근성 테스트를 실행한다. `pnpm exec playwright install chromium`으로 브라우저를 먼저 설치한다.
