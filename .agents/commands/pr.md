# /pr - PR 작성 및 draft PR 생성

## 역할
현재 브랜치와 대상 브랜치(base)의 차이를 분석하여 PR 설명을 작성하고,
사용자 승인 후 브랜치 push와 draft PR 생성까지 실행한다.
**머지는 절대 하지 않는다** — 머지는 사용자의 몫이다.

## 실행 순서

### 1. 브랜치 및 변경사항 파악

**base 브랜치**: 항상 `main` (GitHub flow).

로컬 main은 오래됐을 수 있다 — 반드시 origin 기준으로 비교한다.

```bash
git fetch origin main
git log origin/main..HEAD --oneline
git diff origin/main...HEAD --stat
git diff origin/main...HEAD
```

### 2. PR 템플릿 확인
`.github/pull_request_template.md`를 읽어 해당 형식을 그대로 따른다.

### 3. PR 설명 작성

> PR 제목 컨벤션(Squash 병합 시 이 제목이 최종 커밋 메시지가 됨) → **AGENTS.md — Git 워크플로우 섹션 참고**

PR 템플릿을 기반으로 작성하되, 다음 내용을 포함한다.

**요약**
- 이 PR이 무엇을 하는지 한 문장으로

**작업 내용**
- 주요 변경사항을 체크리스트로 (커밋 단위가 아니라 기능/의도 단위로)
- 화면이면 화면 ID와 Figma 노드 ID

**스크린샷**
- 바뀐 화면의 390×844 캡처 (기본 / 큰 글씨). 사용자에게 받거나 직접 캡처한 파일을 첨부하도록 안내한다

**기타 (기술적 변경 포인트)**
- 설계상 중요한 결정 사항, 리뷰어가 특히 봐야 할 부분
- 디자인과 다르게 구현한 부분과 이유
- 인증 관련 변경 포함 여부 (`apps/web/lib/auth/`, `apps/web/lib/api/client.ts` 수정 시 명시)

**타 직군 전달 사항**
- 백엔드: 필요한 API·필드, 응답이 명세와 다른 점
- 디자인: Figma와 다르게 간 부분, 확인이 필요한 값
- 환경 변수 추가 여부

### 4. 초안 저장 및 승인 요청
`.ai-workspace/pr.md`에 저장하고 사용자에게 전문을 보여준 뒤 다음 메시지로 대기한다.
(`.ai-workspace/` 디렉토리가 없으면 생성 후 저장)

```
PR 초안입니다. "승인"이라고 답하시면 push 후 draft PR을 생성합니다.
```

### 5. push 및 draft PR 생성 (사용자 승인 후에만)
```bash
git push -u origin <브랜치명>

# draft PR 생성 — base는 main
gh pr create --draft --base main --title "<제목>" --body-file .ai-workspace/pr.md
```

생성된 PR URL을 사용자에게 보고한다.

### 6. 상태 파일 정리
`.ai-workspace/pr.md` 상단에 완료 기록을 추가한다 (다음 작업이 낡은 초안을 읽지 않게):
```
> ✅ 완료 — PR: <URL> (생성일)
```

## 주의사항
- 사용자 승인 없이 push/PR 생성 금지
- PR 머지(`gh pr merge`) 절대 금지
- main으로의 직접 push 절대 금지
- 1000줄 이상 diff인 경우 전체 분석 대신 `--stat` 기반으로 요약하고 사용자에게 알림 (`pnpm-lock.yaml`은 분석에서 제외)
- main 브랜치에서 실행 중이라면(= PR을 열 소스 브랜치가 main 자신인 경우) 경고 후 중단
