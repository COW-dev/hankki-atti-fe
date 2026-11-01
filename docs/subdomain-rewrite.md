---
title: 서브도메인 분리와 배포 구조
date: 2026-11-01
tags: [nextjs, spring, kubernetes, subdomain]
aliases: [서브도메인 분리, admin 서브도메인, 배포 구조]
---

# 서브도메인 분리와 배포 구조

`apps/web` 하나의 Next.js 앱을 Host에 따라 나눠서 보여 준다. 이미지 빌드·버전 규칙은 [AGENTS.md](../AGENTS.md) "배포 (CD)".

| 도메인 | 사용자 | `app/` 폴더 |
|---|---|---|
| `atti.bluerack.org` | 장애학생·비로그인 | `app/` |
| `helper.atti.bluerack.org` | 도우미 | `app/helper/` |
| `admin.atti.bluerack.org` | 관리자 | `app/admin/` |

## 구조

```text
브라우저 → 클러스터 라우팅 (세 도메인 모두, Host 유지)
            ├─ /api/*  → 백엔드 (hankki-atti-be :8080), /api 접두사 유지
            └─ 나머지  → 프론트 (hankki-atti-fe :3000) → proxy.ts가 Host로 분기
```

프론트 서버는 `/api`를 처리하지 않는다. 라우팅이 잘못되어 `/api/*`가 프론트로 오면 404가 된다.

## 화면: proxy.ts rewrite

App Router는 경로만 보고 페이지를 고르므로 `admin.x/users`와 `x/users`가 같은 페이지가 된다. 그래서 `apps/web/proxy.ts`가 Host를 경로로 바꾼다.

- `admin.x/users` → `/admin/users`. redirect가 아니라 rewrite라 주소창은 그대로다
- 메인 도메인에서 `/helper`·`/admin`으로 직접 들어오면 `/`로 보낸다
- 판단 로직은 `lib/site.ts`의 `resolveSiteRoute`이고 `site.test.ts`로 검증한다
- proxy는 권한을 판단하지 않는다. 화면은 `useSessionGuard(역할)`, 최종 판단은 서버가 한다
- 다른 도메인으로 가는 링크는 `siteUrl('helper', 경로)`. `NEXT_PUBLIC_SITE_URL` 앞에 서브도메인을 붙인다

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
| HTTPS | `https://atti.bluerack.org` | `true` (백엔드 기본값) | `CORS_ALLOWED_ORIGINS`에 `https://` 도메인 3개 |
| HTTP | `http://atti.bluerack.org` | `false` — `Secure` 쿠키는 HTTP에서 저장되지 않아 새로고침하면 로그아웃된다 | 구간이 평문이므로 테스트 계정·테스트 데이터만 쓴다 |

HTTPS를 라우팅 단계에서 끝내면 백엔드는 요청을 HTTP로 받는다. 그러면 브라우저가 POST에 붙이는 `Origin`(`https://…`)과 scheme이 달라 같은 출처여도 CORS 요청으로 판정되고, 목록에 없는 도메인은 403이 된다.

## 인프라 조건

- `Host`를 그대로 넘긴다. 빠지면 서브도메인 분기 전체가 동작하지 않는다
- 프론트 포트는 3000이고 실행 환경변수는 필요 없다. 준비 상태 확인은 `GET /`(200)로 한다
- 이미지는 UID 1000으로 돈다. `runAsNonRoot`를 켜도 된다
- 백엔드 refresh 쿠키에 Domain을 지정하지 않는다. 지정하면 서브도메인끼리 로그인이 섞인다

## 트러블슈팅

| 증상 | 원인 |
|---|---|
| admin 도메인인데 메인 페이지가 나옴 | 라우팅이 `Host`를 바꿈, 또는 proxy matcher가 경로를 제외함 |
| 주소창에 `/admin`이 보임 | 링크에 `/admin` 접두사를 붙임, 또는 rewrite 대신 redirect를 씀 |
| API가 전부 404 | `/api`가 프론트로 라우팅됨 |
| 특정 도메인에서만 API가 403 | 그 도메인이 `CORS_ALLOWED_ORIGINS`에 없음 |
| 새로고침하면 로그아웃됨 | HTTP로 서비스하는데 refresh 쿠키가 `Secure` |
| 다른 도메인 링크가 잘못된 주소로 감 | `ci.yml`의 `NEXT_PUBLIC_SITE_URL` (런타임 환경변수로는 안 바뀐다) |
| 서브도메인을 옮기면 다시 로그인해야 함 | 의도한 동작 (쿠키 공유 안 함) |
| `/administrator` 같은 경로가 차단됨 | `startsWith('/admin')` 사용 → `isUnder` 방식 사용 |

Related: 관리자 화면이 커지거나 데스크톱 레이아웃이 사용자 앱과 많이 달라지면 `apps/admin`(모노레포 안 두 번째 Next 앱)으로 분리할 수 있다. `packages/ui`·`tokens`는 그대로 공유한다.
