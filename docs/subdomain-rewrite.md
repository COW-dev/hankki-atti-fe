---
title: 서브도메인 분리와 배포 구조
date: 2026-11-01
tags: [nextjs, spring, kubernetes, subdomain]
aliases: [서브도메인 분리, admin 서브도메인, 배포 구조]
---

# 서브도메인 분리와 배포 구조

`apps/web` 하나의 Next.js 앱을 Host에 따라 나눠서 보여 준다. 장애학생과 도우미는 메인 도메인을 같이 쓰고 관리자만 서브도메인이다. 이미지 빌드·버전 규칙은 [AGENTS.md](../AGENTS.md) "배포 (CD)".

| 도메인 | 사용자 | `app/` 폴더 |
|---|---|---|
| `atti.bluerack.org` | 장애학생·비로그인 | `app/` |
| `atti.bluerack.org/helper` | 도우미 | `app/helper/` |
| `admin.atti.bluerack.org` | 관리자 | `app/admin/` |

## 구조

```text
브라우저 → 클러스터 라우팅 (모든 도메인, Host 유지)
            ├─ /api/*  → 백엔드 (hankki-atti-be :8080), /api 접두사 유지
            └─ 나머지  → 프론트 (hankki-atti-fe :3000) → proxy.ts가 Host로 분기
```

프론트 서버는 `/api`를 처리하지 않는다. 라우팅이 잘못되어 `/api/*`가 프론트로 오면 404가 된다.

## 화면: proxy.ts rewrite

App Router는 경로만 보고 페이지를 고르므로 `admin.x/users`와 `x/users`가 같은 페이지가 된다. 그래서 `apps/web/proxy.ts`가 Host를 경로로 바꾼다.

- `admin.x/users` → `/admin/users`. redirect가 아니라 rewrite라 주소창은 그대로다
- 메인 도메인에서 `/admin`으로 직접 들어오면 `/`로 보낸다
- 없어진 `helper.` 도메인은 `NEXT_PUBLIC_SITE_URL`의 메인 주소로 redirect한다. `helper.x/matches` → `x/helper/matches`, 합쳐진 `/login`·`/password-reset`은 `/helper` 없이 같은 경로로 보낸다
- 판단 로직은 `lib/site.ts`의 `resolveSiteRoute`이고 `site.test.ts`로 검증한다
- proxy는 권한을 판단하지 않는다. 화면은 `useSessionGuard(역할)`, 최종 판단은 서버가 한다

## 로그인과 역할

장애학생과 도우미는 메인 도메인의 `/login`으로 로그인하고 역할별 첫 화면으로 간다(`homePathOf`). 다른 역할의 화면에 들어오면 `useSessionGuard`가 자기 첫 화면으로 보낸다. 두 역할이 같이 쓰는 화면의 링크는 `rolePath(역할, 경로)`로 만든다. 관리자 화면은 `/api/admin/me`를 쓸 수 없는 토큰이면 `/login`으로 보낸다.

## API 주소

| 환경 | `NEXT_PUBLIC_API_BASE_URL` | 브라우저가 부르는 주소 |
|---|---|---|
| 로컬 (`pnpm dev`) | 없음 또는 `.env.local` 값 | `http://localhost:8080` (백엔드 CORS 허용 목록에 로컬 주소 필요) |
| 이미지 | 빈 문자열 (`Dockerfile`) | 같은 도메인의 `/api/*` |

`lib/api/client.ts`는 `??`로 기본값을 고르므로 빈 문자열이면 상대경로가 된다. 브라우저 입장에서 같은 출처이고, refresh 쿠키는 응답을 받은 도메인에만 붙어 서브도메인끼리 공유되지 않는다.

## 사이트 주소와 HTTPS

`NEXT_PUBLIC_SITE_URL`은 빌드 때 번들에 박힌다. 값은 `.github/workflows/ci.yml`의 `docker` job `env` 한 곳에 있고, 이 줄만 고쳐 병합하면 새 버전이 나온다. `Dockerfile`에는 기본값이 없어 값 없이 빌드하면 실패한다.

서비스 프로토콜에 따라 백엔드 설정도 맞아야 한다.

| 서비스 프로토콜 | `NEXT_PUBLIC_SITE_URL` | refresh 쿠키 `secure` | 그 밖의 조건 |
|---|---|---|---|
| HTTPS | `https://atti.bluerack.org` | `true` (백엔드 기본값) | `CORS_ALLOWED_ORIGINS`에 메인·admin `https://` 도메인 |
| HTTP | `http://atti.bluerack.org` | `false` — `Secure` 쿠키는 HTTP에서 저장되지 않아 새로고침하면 로그아웃된다 | 구간이 평문이므로 테스트 계정·테스트 데이터만 쓴다 |

HTTPS를 라우팅 단계에서 끝내면 백엔드는 요청을 HTTP로 받는다. 그러면 브라우저가 POST에 붙이는 `Origin`(`https://…`)과 scheme이 달라 같은 출처여도 CORS 요청으로 판정되고, 목록에 없는 도메인은 403이 된다.

## FE 이미지 배포·롤백

`ci.yml`은 기존 검사 → 버전 결정 → 이미지 빌드·스모크 테스트·GHCR 업로드를 담당한다. 업로드에 성공한 경우에만 `deploy.yml`을 재사용 워크플로로 호출하고 업로드한 `vX.Y.Z`를 전달한다. GHCR 업로드 인증은 기존 `GITHUB_TOKEN`을 유지한다.

`deploy.yml`은 이미지가 GHCR에 존재하는지 확인하고, `DEPLOY_SSH_KEY`로 `DEPLOY_REPOSITORY`를 checkout한다. 대상은 `COW-dev/hankki-atti-deploy`의 `main`, 파일은 `k8s/fe/atti-fe.yaml`, 이미지는 `ghcr.io/cow-dev/hankki-atti-fe:vX.Y.Z`다. `DEPLOY_REPOSITORY`는 `COW-dev/hankki-atti-deploy` 형식으로 설정한다. SSH 키는 배포 저장소에 쓰기 권한이 있어야 한다.

FE 이미지 한 곳만 변경·커밋하고 일반 push한다. 같은 버전이면 변경 없이 성공한다. BE와 동시 push로 거절되면 실패한 배포 job만 재실행해 최신 main에서 다시 반영한다. force push는 하지 않으며 push 실패는 작업 실패로 남긴다. FE 배포 작업은 concurrency 그룹으로 직렬화한다. 매니페스트 갱신 성공은 클러스터의 실제 rollout 완료를 뜻하지 않으므로 운영 배포 도구에서 동기화·준비 상태를 확인한다.

배포만 재시도하거나 이전 이미지로 롤백할 때는 `Deploy FE` 워크플로를 main에서 수동 실행한다. `latest`와 SHA는 받지 않으며, 지정한 버전 이미지가 없으면 매니페스트를 수정하기 전에 실패한다. 아래 명령은 GitHub CLI가 설치·인증된 환경에서 실행한다.

```bash
# 기존 이미지 배포·실패 재시도 (예시 버전은 실제 업로드된 버전으로 교체)
gh workflow run deploy.yml --repo COW-dev/hankki-atti-fe --ref main -f image_tag=v0.2.0
# 롤백: 이전에 업로드된 버전 지정
gh workflow run deploy.yml --repo COW-dev/hankki-atti-fe --ref main -f image_tag=v0.1.0
# 배포만 실패한 CI 실행은 실패 job만 재실행할 수 있다
gh run rerun <실행_ID> --failed --repo COW-dev/hankki-atti-fe
```

전체 CI를 다시 실행하면 기존 버전 이미지 중복 방지에 걸린다. 배포 재시도는 위 수동 실행 또는 실패 job 재실행을 사용한다. 워크플로만 변경한 PR은 이미지 내용이 같아 자동 이미지 업로드·배포를 생략할 수 있다. 최초 적용 후 기존 이미지 배포는 수동 실행으로 확인한다.

## 인프라 조건

- `Host`를 그대로 넘긴다. 빠지면 서브도메인 분기 전체가 동작하지 않는다
- 기존 주소 redirect가 필요한 동안 `helper.` 도메인도 프론트로 보낸다
- 프론트 포트는 3000이고 실행 환경변수는 필요 없다. 준비 상태 확인은 `GET /`(200)로 한다
- 이미지는 UID 1000으로 돈다. `runAsNonRoot`를 켜도 된다
- 백엔드 refresh 쿠키에 Domain을 지정하지 않는다. 지정하면 서브도메인끼리 로그인이 섞인다

## 트러블슈팅

| 증상 | 원인 |
|---|---|
| admin 도메인인데 메인 페이지가 나옴 | 라우팅이 `Host`를 바꿈, 또는 proxy matcher가 경로를 제외함 |
| 도우미 링크가 장애학생 화면을 거쳐 홈으로 돌아옴 | 링크에 `/helper`가 빠짐 |
| 주소창에 `/admin`이 보임 | 링크에 `/admin` 접두사를 붙임, 또는 rewrite 대신 redirect를 씀 |
| API가 전부 404 | `/api`가 프론트로 라우팅됨 |
| 특정 도메인에서만 API가 403 | 그 도메인이 `CORS_ALLOWED_ORIGINS`에 없음 |
| 새로고침하면 로그아웃됨 | HTTP로 서비스하는데 refresh 쿠키가 `Secure` |
| `helper.` 주소가 잘못된 곳으로 redirect됨 | `ci.yml`의 `NEXT_PUBLIC_SITE_URL` (런타임 환경변수로는 안 바뀐다) |
| 도메인을 옮기면 다시 로그인해야 함 | 의도한 동작 (쿠키 공유 안 함). 기존 `helper.` 세션도 메인에서 다시 로그인한다 |
| `/administrator` 같은 경로가 차단됨 | `startsWith('/admin')` 사용 → `isUnder` 방식 사용 |

Related: 관리자 화면이 커지거나 데스크톱 레이아웃이 사용자 앱과 많이 달라지면 `apps/admin`(모노레포 안 두 번째 Next 앱)으로 분리할 수 있다. `packages/ui`·`tokens`는 그대로 공유한다.
