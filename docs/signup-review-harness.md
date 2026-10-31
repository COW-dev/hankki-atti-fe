# 도우미 회원가입 리뷰 후속 작업

> 작성: 2026-10-29 15:26 (Asia/Seoul) · 브랜치: `feat/#25/api` · 기준 HEAD: `566ff44c25bb9a979f1ce1a470794490ef381abf`
>
> 상태: 코드 수정·자동 검증·브라우저 확인 완료 (2026-10-31), 병합 대기 · 관련 백로그: U-15
>
> 기준은 위 HEAD에 더해 리뷰 당시의 미커밋 회원가입 변경분이다. HEAD만으로는 검토한 코드를 복원할 수 없다.
> 착수할 때 현재 코드와 대조하고, 이미 수정된 항목은 재현·검증 후 닫는다.
> 두 항목의 완료 조건과 공통 검증을 충족하면 즉시 상단에 `✅ 완료 (날짜, 병합 PR)` 배너를 붙이고 U-15를 갱신한다.
> 병합 후 이 문서를 `docs/archive/`로 옮기고 백로그 링크를 고친다. 대체 구현으로 재현 조건이 사라지면 근거를 남기고 종료한다.
> 영구 규칙은 AGENTS.md에 두며, 이 문서는 해당 리뷰의 수정·검증을 추적하는 동안만 유효하다.

## R-01 · 단계 왕복 시 입력값 초기화 (리뷰 우선순위 P2)

**근거:** [HelperSignupScreen.tsx](../apps/web/features/signup/HelperSignupScreen.tsx)의 조건부 렌더링으로
`InfoStep`이 제거되고, 다시 진입하면 [InfoStep.tsx](../apps/web/features/signup/InfoStep.tsx)의
`useState(EMPTY_FORM)`이 실행된다. 브라우저에서 이름 입력 후 아래 순서로 초기화를 재현했다.

1. `helper.localhost:3000/signup`에서 안내 7개를 확인하고 ‘다음’을 누른다.
2. 정보 입력 단계에 값을 입력한다.
3. 상단 ‘뒤로’로 안내 단계에 돌아갔다가 ‘다음’을 누른다.
4. 기대: 입력값 유지. 현재: 모든 입력값과 아띠 소속 선택이 초기화된다.

**수정 범위:** 폼 상태를 단계 전환 중 유지되는 `HelperSignupScreen`으로 옮기고 `InfoStep`에 값·변경 함수를 전달한다.
입력값은 화면의 메모리에만 둔다. 주소·localStorage·sessionStorage에 비밀번호나 개인정보를 저장하지 않는다.

**완료 조건:**

- [x] 이름·학번·이메일·카톡 ID·전화번호·비밀번호·확인·아띠 소속을 입력한 뒤 단계 왕복 시 그대로 유지된다. — 폼 상태를 `HelperSignupScreen`으로 옮김 (`EMPTY_SIGNUP_FORM`은 [signup-form.ts](../apps/web/features/signup/signup-form.ts))
- [x] 브라우저 뒤로/앞으로 이동에도 단계 왕복 중 입력값이 유지된다. — Playwright(Chromium, 390×844)로 `helper.localhost:3000/signup` 확인 (2026-10-31, HEAD `325a03f`): 상단 ‘뒤로’ 왕복과 브라우저 뒤로/앞으로 모두 입력 7칸·아띠 소속 유지
- [x] 안내 읽음 상태, 단계 제목 포커스, 안내를 읽기 전 `#info` 직접 진입 차단이 유지된다. — 직접 진입 차단은 화면 테스트로 검증
- [x] 실제 API를 호출하지 않는 화면 테스트로 입력 → 이전 단계 → 다음 단계의 값 보존을 검증한다. — [HelperSignupScreen.test.tsx](../apps/web/features/signup/HelperSignupScreen.test.tsx)

## R-02 · 서버 길이 제한과 프론트 검증 불일치 (리뷰 우선순위 P2)

**근거:** [signup-form.ts](../apps/web/features/signup/signup-form.ts)의 `validateSignup`은
이름·카톡 ID에 51자를 넣어도 오류를 반환하지 않는다. 두 입력 모두 직접 실행해 확인했다.
서버의 길이 오류는 [api.ts](../apps/web/features/signup/api.ts)에서 일반 오류로 처리하므로
입력칸의 `aria-describedby`와 첫 오류 포커스로 연결되지 않는다.

백엔드 로컬 소스 `hankki-atti-be` 기준 HEAD `a14a479`에서 확인한 제한:

| 입력 | 최대 길이 | 근거 (백엔드 `src/main/java/com/hankkiatti/` 기준) |
| --- | --- | --- |
| 이름 | 50자 | `domain/helper/dto/request/HelperSignupRequestDto.java`의 `@Size(max = 50)` |
| 카톡 ID | 50자 | `domain/common/validation/KakaoId.java`의 `@Size(max = 50)` |

**수정 범위:** `validateSignup`에 누락된 길이 검증을 추가하고 해당 필드의 오류로 반환한다.
이름은 요청에 보내는 trim 이후 값을, 카톡 ID는 그대로 보내는 값을 기준으로 검증한다.
기존 오류 표시·설명 연결·첫 오류 포커스를 재사용한다. 서버 오류의 `message`를 파싱하지 않는다.

**완료 조건:**

- [x] 이름 50/51자, 카톡 ID 50/51자의 허용·거부 경계를 단위 테스트로 검증한다. — [signup-form.test.ts](../apps/web/features/signup/signup-form.test.ts)
- [x] 다른 필드가 유효할 때 길이 초과 필드에만 오류를 반환한다.
- [x] 길이 초과 입력은 API 제출을 막고 해당 입력칸에 오류 문구·`aria-describedby`·첫 오류 포커스를 제공한다. — 이름 51자 화면 테스트로 검증
- [x] 공백 제거, 학교 이메일, 비밀번호 규칙, 중복 이메일·학번 오류 처리가 유지된다. — 기존 단위 테스트 통과

## 검증과 종료

수정 전 리뷰에서 전체 단위 테스트 55개 파일·238개 테스트, 변경 코드 ESLint·Prettier, `pnpm typecheck`는 통과했다.
위 두 문제의 회귀 테스트는 아직 없으므로 이 통과 기록을 수정 완료의 근거로 쓰지 않는다.

- [x] 각 항목의 회귀 테스트가 수정 전에는 실패하고 수정 후에는 통과하는지 확인한다. — 수정 전 4건 실패(값 초기화 1, 길이 초과 화면 1, 길이 경계 2), 수정 후 통과
- [x] `pnpm exec vitest run --project unit apps/web/features/signup`으로 관련 테스트를 실행한다. — 3개 파일·24개 통과
- [x] `pnpm check`를 통과하고, 브라우저에서 단계 왕복·필드 오류·큰 글씨 상태를 확인한다. — `pnpm check` 통과(HEAD `325a03f`, 95개 파일·447개). Playwright(Chromium, 390×844)로 `helper.localhost:3000/signup` 확인 (2026-10-31, HEAD `325a03f`): `#info` 직접 진입 차단, 다 읽기 전 ‘다음’ inactive·포커스 가능, 뒤로 온 뒤 1단계 제목 포커스, 이름 51자 → 오류 요약·`aria-invalid`·`aria-describedby`·첫 오류 포커스·가입 API 미호출, 큰 글씨 켬에서 가로 스크롤·잘림 없음
- [ ] 실제 가입 API 연동·최신 Figma 대조는 최초 리뷰에서 미확인이다. 별도 검증 여부와 결과를 기록한다. — 2026-10-31 브라우저 확인은 백엔드 없이 진행해 가입 성공·중복 오류 응답은 확인하지 않았다. Figma 대조도 하지 않았다
- [ ] 백로그 U-15 상태와 근거를 갱신하고 위 완료·아카이브 규칙을 적용한다. — U-15 근거에 수정 내용 반영. 완료 배너·아카이브는 병합 후

안내 자료 콘텐츠·준비 중 처리 정책(D-06), 문자 수신 동의·약관 정책(D-08)은 기존 백로그에서 추적한다.
이 문서의 완료는 해당 정책이나 회원가입 전체의 출시 검증 완료를 뜻하지 않는다.
