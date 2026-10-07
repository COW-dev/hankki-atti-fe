# /review - 변경사항 셀프 리뷰

## 역할
구현된 변경사항을 AGENTS.md와 `docs/design-system.md` 기준으로 셀프 리뷰한다.
FAIL 항목은 수정안을 제시하고 사용자 승인을 받는다.

## 실행 순서

### 1. 변경사항 파악

브랜치에서 이미 커밋한 변경까지 포함해 리뷰한다 — 미커밋 diff만 보면 커밋 후 실행 시 리뷰가 빈다.

```bash
git fetch origin main
git diff origin/main...HEAD   # 브랜치의 커밋된 변경 전체
git diff HEAD                 # 아직 커밋하지 않은 변경
```

두 diff 모두 비어있으면 즉시 다음 메시지를 출력하고 종료한다:
```
리뷰할 변경사항이 없습니다.
```

### 2. 체크리스트 항목별 검토

각 항목에 대해 **PASS / FAIL / N/A** 와 근거를 작성한다.

---

**[디자인 시스템]**
- [ ] `#hex`, `rgb()`, Tailwind 기본 팔레트(`bg-gray-100` 등)가 없는가 — 토큰만 썼는가
- [ ] 글자에 `typo-*` 외의 `font-bold`·`leading-*`·`text-[Npx]`를 쓰지 않았는가
- [ ] 버튼 높이·글자 크기·아이콘 크기를 px로 고정하지 않았는가 (크기 모드 토큰 사용)
- [ ] 화면이 `PageShell`의 올바른 `size`(장애학생·비로그인 L, 도우미 M)를 쓰는가
- [ ] 버튼·입력칸·안내를 화면에서 직접 그리지 않고 `packages/ui/src`를 썼는가
- [ ] 새 `packages/ui/src` 컴포넌트에 Figma 노드 ID가 있고 `docs/design-system.md` 표를 갱신했는가
- [ ] 민트(brand/200) 위에 흰 글자가 없는가, 민트를 주 버튼·선택 상태 외에 쓰지 않았는가
- [ ] 문구가 목업과 같은가, "신청" 용어를 썼는가

**[접근성]**
- [ ] 화면에 h1이 하나인가 (TopBar 제목)
- [ ] 모든 입력에 label이 있고, 규칙·오류가 `aria-describedby`로 연결됐는가
- [ ] 못 누르는 버튼이 `disabled`가 아니라 `inactive`(aria-disabled)이고 이유를 읽어 주는가
- [ ] 아이콘만 있는 버튼에 `aria-label`이 있고, 장식 아이콘·기호는 `aria-hidden`인가
- [ ] 상태를 색만으로 구분하지 않는가
- [ ] 오류·완료 문구가 알맞은 aria-live(assertive/polite)로 읽히는가
- [ ] `outline-none` 등으로 포커스 표시를 지우지 않았는가
- [ ] 모달이면: dialog 역할, 제목 포커스, 포커스 가두기, Esc, 닫힌 뒤 복귀
- [ ] 큰 글씨 모드에서 잘림·겹침이 없는가 (화면 확인 결과)

**[API · 인증]**
- [ ] `fetch`를 직접 부르지 않고 `apiRequest`/`authRequest`를 썼는가
- [ ] 오류 분기를 `message`가 아니라 `ApiError.code`로 하는가
- [ ] 토큰을 localStorage·sessionStorage·쿠키에 저장하지 않는가
- [ ] 보호 화면에 `useSessionGuard`가 있는가
- [ ] `apps/web/lib/auth/`, `apps/web/lib/api/client.ts`가 수정됐다면 사람 리뷰 필요를 명시했는가

**[도메인 규칙]**
- [ ] 매칭 전 도우미 화면에 학생 개인정보를 그리지 않는가 (화면 숨김으로 처리하지 않았는가)
- [ ] 장애 유형·특이사항이 `console`에 남지 않는가
- [ ] 상태 enum 표시 문구를 한곳의 매핑으로 처리하는가

**[React · Next.js]**
- [ ] `"use client"`가 꼭 필요한 파일에만 있는가
- [ ] effect 안에서 상태를 동기적으로 바꾸는 코드가 없는가 (lint `react-hooks` 통과)
- [ ] 목록 key가 index가 아닌 고유값인가

**[테스트]**
- [ ] 새 `apps/web/lib/` 로직과 `packages/ui/src` 동작에 테스트가 있는가
- [ ] 역할·이름으로 요소를 찾는가 (`data-testid` 없음)
- [ ] assertion 없는 테스트, 스냅샷 테스트가 없는가

**[코드 정리]**
- [ ] 사용하지 않는 import·변수가 없는가
- [ ] 주석 처리된 코드가 없는가
- [ ] TODO 주석이 남아있다면 명시

---

### 3. 결과 보고

**FAIL 항목 처리**
- FAIL인 항목에 대해 구체적인 수정 코드 제안
- 사용자 승인 후 수정 진행

**보고 형식**
```
[디자인 시스템] FAIL - app/requests/page.tsx:24 text-[15px] 사용. 수정안: typo-body
[접근성] PASS
[API · 인증] N/A - API 호출 없음
...

총 FAIL: X건 - 수정안 검토 후 승인 부탁드립니다.
```

## 주의사항
- 코드를 직접 수정하지 않는다. 리뷰 -> 승인 -> 수정 순서를 지킨다
- PASS로 처리하기 애매한 항목은 FAIL로 처리하고 사용자에게 판단을 맡긴다
