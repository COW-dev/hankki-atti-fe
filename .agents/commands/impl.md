# /impl - 계획 기반 구현

## 역할
`.ai-workspace/plan.md`에 승인된 계획대로만 구현한다.
계획에 없는 변경, 리팩토링, 정리는 하지 않는다.

## 사전 조건
- `.ai-workspace/plan.md` 파일이 존재해야 한다
- 사용자가 /plan 결과를 승인한 상태여야 한다

## 실행 순서

### 0. 사전 조건 확인
`.ai-workspace/plan.md` 파일 존재 여부와 **현재 작업과의 일치 여부**를 확인한다.

파일이 없으면 즉시 다음 메시지를 출력하고 종료한다:
```
.ai-workspace/plan.md 파일이 없습니다.
/plan을 먼저 실행하세요.
```

파일이 있으면 상단의 기준점(작성일·브랜치·기준 HEAD)을 현재 상태와 대조한다.
브랜치가 다르거나, 계획 내용이 지금 요청받은 작업과 무관하면 — 과거 작업의 잔재이므로 —
구현을 시작하지 말고 사용자에게 보고한다:
```
plan.md가 현재 작업과 일치하지 않습니다 (기준: <브랜치>@<SHA>, 내용: <제목>).
/plan을 다시 실행할까요?
```

### 1. 계획 확인
- `.ai-workspace/plan.md` 읽기
- AGENTS.md, `docs/design-system.md` 읽어 컨벤션 재확인
- Next.js API를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 문서 확인 (Next.js 16은 학습 데이터와 다를 수 있다)

### 2. 구현
계획의 작업 순서대로 파일을 생성/수정한다.

**자주 놓치는 포인트 (빠른 참조)**

| 항목 | 규칙 |
|---|---|
| 색·간격·모서리 | 토큰만: `bg-(--color-bg-muted)`, `gap-(--space-xs)`. `#hex`·Tailwind 팔레트 금지 |
| 글자 | `typo-*` 7개만. `font-bold`·`leading-*`·`text-[15px]` 금지 |
| 높이·글자 크기 | 크기 모드 토큰(`--control-height`, `--icon-size`)으로. px 고정 금지 |
| 화면 틀 | `PageShell size="L"`(장애학생·비로그인) / `"M"`(도우미) |
| 버튼 | `components/ui/Button`. 못 누르는 상태는 `inactive` (disabled 금지). 화면 이동은 같은 모양의 `ButtonLink` (`<a>`) |
| 입력칸 | `components/ui/TextField` (label 필수, 오류는 `error`, 규칙 안내는 `describedBy`) |
| 오류 안내 | `ErrorNotice` (role="alert") |
| 아이콘 | `Icon name="..."` — 장식용, 의미는 텍스트로. 아이콘만 있는 버튼은 `aria-label` |
| API | `apiRequest` / `useAuth().authRequest`. `fetch` 직접 호출 금지, 분기는 `ApiError.code` |
| 토큰 저장 | 메모리만. localStorage·sessionStorage 금지 |
| 보호 화면 | `useSessionGuard(역할)` |
| 블라인드 | 매칭 전 도우미 화면에 학생 개인정보를 그리지 않음 (서버가 안 줘야 정상) |
| 문구 | 목업 문구 그대로, "신청" (예약 X) |

- 새 파일 생성 시: 파일 경로와 생성 이유를 한 줄로 사용자에게 알림
- 화면 파일 상단 주석에 화면 ID와 Figma 노드 ID를 적는다

### 3. 정적 검사
구현 완료 후 반드시 실행:
```bash
pnpm typecheck
pnpm lint
pnpm format
```

**실패 시**
- 즉시 구현 중단
- 오류 메시지 전문을 사용자에게 보고
- 수정 방향 제안 후 승인 대기

### 4. 테스트 작성 및 실행 (필수)
`lib/` 로직과 `components/ui` 동작의 테스트를 함께 작성한다.

> 작성 기준 → **AGENTS.md — 테스트 컨벤션 섹션 참고**

- 요소는 역할·이름으로 찾는다 (`getByRole`)
- 실행: `pnpm test`
- **테스트 없는 구현은 완료가 아니다**

### 5. 화면 확인
화면을 바꿨으면 `pnpm dev`로 띄워 390×844에서 확인한다.
- Figma 목업과 비교 (상태별 프레임 모두)
- 큰 글씨 토글을 켜고 잘림·겹침 확인
- 키보드만으로 끝까지 진행 가능한지, 포커스 링이 보이는지 확인

### 6. 결과 보고
- 생성/수정한 파일 목록
- 검사·테스트 결과, 화면 확인 결과(스크린샷)
- 계획 대비 변경된 사항이 있으면 명시

## 주의사항
- 자동 커밋/푸시 절대 금지
- 계획에 없는 파일 수정 금지
- 계획에 없는 리팩토링, 코드 정리 금지
- 인증 관련 파일(`lib/auth/`, `lib/api/client.ts`) 수정 포함 시 구현 전 사용자에게 재확인
