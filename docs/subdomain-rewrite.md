---
title: 서브도메인 분리와 Vercel 배포
date: 2026-11-01
tags: [nextjs, spring, vercel, subdomain]
aliases: [서브도메인 분리, admin 서브도메인, Vercel 배포]
---

# 서브도메인 분리와 Vercel 배포

`apps/web` 하나의 Next.js 앱을 Host에 따라 나눠서 보여 주고, Vercel에 배포한다.

| 도메인 | 사용자 | `app/` 폴더 |
|---|---|---|
| `atti.bluerack.org` | 장애학생·비로그인 | `app/` |
| `helper.atti.bluerack.org` | 도우미 | `app/helper/` |
| `admin.atti.bluerack.org` | 관리자 | `app/admin/` |

백엔드 API는 `http://api.atti.bluerack.org`이고 HTTP만 된다.

## 구조

```text
브라우저 ─ https ─ Vercel
                    ├─ /api/*  → next.config.ts rewrite ─ http ─ 백엔드 /api/*
                    └─ 나머지  → proxy.ts가 Host로 분기 → app/ 폴더
```

## 화면: proxy.ts rewrite

App Router는 경로만 보고 페이지를 고르므로 `admin.x/users`와 `x/users`가 같은 페이지가 된다. 그래서 `apps/web/proxy.ts`가 Host를 경로로 바꾼다.

- `admin.x/users` → `/admin/users`. redirect가 아니라 rewrite라 주소창은 그대로다
- 메인 도메인에서 `/helper`·`/admin`으로 직접 들어오면 `/`로 보낸다
- 판단 로직은 `lib/site.ts`의 `resolveSiteRoute`이고 `site.test.ts`로 검증한다
- proxy는 권한을 판단하지 않는다. 화면은 `useSessionGuard(역할)`, 최종 판단은 서버가 한다
- 다른 도메인으로 가는 링크는 `siteUrl('helper', 경로)`. `NEXT_PUBLIC_SITE_URL` 앞에 서브도메인을 붙인다

## API: next.config.ts rewrite

브라우저에서 HTTP API를 바로 부르면 mixed content로 막히고, refresh 쿠키(`__Host-`, `Secure`, `SameSite=Strict`, Domain 없음, `Path=/`)도 저장되지 않는다. 그래서 브라우저는 자기 도메인의 `/api/*`를 부르고, Vercel이 백엔드로 넘긴다.

- 브라우저 입장에서는 같은 출처다. 쿠키는 응답을 받은 도메인에만 붙으므로 서브도메인끼리 공유되지 않는다
- `proxy.ts` matcher가 `api`로 시작하는 경로를 건너뛰어 `/helper`·`/admin` 접두사가 붙지 않는다
- `API_PROXY_TARGET`이 있으면 `next.config.ts`가 rewrite를 추가하고 `NEXT_PUBLIC_API_BASE_URL`을 빈 문자열로 고정한다. 그러면 `lib/api/client.ts`의 호출이 상대경로가 된다
- `API_PROXY_TARGET`은 빌드 때 라우팅 설정에 고정된다. 값을 바꾸면 다시 배포해야 한다

| 환경 | `API_PROXY_TARGET` | 브라우저가 부르는 주소 |
|---|---|---|
| 로컬 (`pnpm dev`) | 없음 | `NEXT_PUBLIC_API_BASE_URL` (기본 `http://localhost:8080`) |
| Vercel | `http://api.atti.bluerack.org` | 같은 도메인의 `/api/*` |

로컬에서는 브라우저가 백엔드를 다른 출처로 부르므로 백엔드 CORS 허용 목록에 로컬 주소가 있어야 한다.

## 제약: 테스트 계정만 쓴다

API에 HTTPS가 붙기 전까지 Vercel과 백엔드 사이는 평문이다. 브라우저에서 Vercel까지만 암호화되고, 비밀번호·토큰·refresh 쿠키·개인정보가 이 구간을 그대로 지난다. 그래서 **테스트 계정과 테스트 데이터만 쓰고, 실제 장애학생 정보는 넣지 않는다.** API에 HTTPS가 붙으면 `API_PROXY_TARGET`을 `https://`로 바꾸고 다시 배포한다.

## Vercel 프로젝트 설정

| 설정 | 값 |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Include source files outside of the Root Directory | 켬 — `packages/*`를 읽는다 |
| Node.js Version | `24.x` — CI와 같은 버전 |

| 환경변수 (Production·Preview) | 값 |
|---|---|
| `API_PROXY_TARGET` | `http://api.atti.bluerack.org` — 끝에 `/api`를 붙이지 않는다 |
| `NEXT_PUBLIC_SITE_URL` | `https://atti.bluerack.org` |
| `NEXT_PUBLIC_API_BASE_URL` | 넣지 않는다. 넣어도 `API_PROXY_TARGET`이 있으면 쓰지 않는다 |

도메인은 위 표의 3개를 같은 프로젝트에 연결한다.

**빌드 명령** — `apps/web/vercel.json`에 있다. `public/icons`는 Root Directory 밖을 가리키는 심링크인데, Vercel 빌드 결과에 심링크 그대로 들어가므로 빌드 전에 실제 파일로 바꾼다. 로컬 `pnpm build`에는 영향이 없다. 로컬에서 `vercel build`를 돌리면 심링크가 폴더로 바뀌니 `git checkout -- apps/web/public/icons`로 되돌린다.

**pnpm** — 설치는 저장소 루트의 lockfile과 `pnpm-workspace.yaml`을 기준으로 한다. Vercel이 고른 pnpm이 10이어도 `packageManager`를 따라 11.5.0으로 바뀐다. 빌드 로그의 `using pnpm v…`로 확인한다.

## 백엔드 조건

- 경로는 `/api/...`로 통일한다. rewrite가 경로를 그대로 넘긴다
- `CORS_ALLOWED_ORIGINS`에 도메인 3개를 모두 넣는다. 브라우저는 같은 출처 요청이어도 POST에 `Origin`을 붙이고, Next rewrite는 이 헤더를 그대로 넘긴다 (`next start`로 확인. Vercel 프록시의 동작은 공식 문서에 없다). 백엔드 입장에서는 `Host`(API 주소)와 `Origin`이 달라 CORS 요청이 되므로, 목록에 없으면 403으로 막힌다
- refresh 쿠키에 Domain을 지정하지 않는다. 지정하면 서브도메인끼리 로그인이 섞인다
- 응답에 `Cache-Control: no-store`를 유지한다. Vercel CDN은 외부 rewrite 응답의 캐시 헤더를 따르므로, 캐시를 허용하는 헤더를 보내면 개인정보가 담긴 응답이 캐시될 수 있다

## 트러블슈팅

| 증상 | 원인 |
|---|---|
| admin 도메인인데 메인 페이지가 나옴 | proxy matcher가 경로를 제외함, 또는 앞단 프록시가 `Host`를 바꿈 |
| 주소창에 `/admin`이 보임 | 링크에 `/admin` 접두사를 붙임, 또는 rewrite 대신 redirect를 씀 |
| 배포에서 API가 `localhost:8080`으로 감 | `API_PROXY_TARGET` 없이 빌드함 |
| `API_PROXY_TARGET`을 바꿨는데 그대로임 | 다시 배포하지 않음 |
| 빌드가 `Invalid rewrite found`로 실패 | `API_PROXY_TARGET`에 `http://`·`https://`가 빠짐 |
| `/api/api/...`로 404 | `API_PROXY_TARGET` 끝에 `/api`를 붙임 |
| 특정 도메인에서만 API가 403 | 그 도메인이 `CORS_ALLOWED_ORIGINS`에 없음 |
| Preview 주소에서 API가 403 | `*.vercel.app` 주소가 `CORS_ALLOWED_ORIGINS`에 없음. Preview 주소는 메인 화면으로만 열린다 |
| 아이콘이 404 | Root Directory가 `apps/web`이 아니어서 `apps/web/vercel.json`을 읽지 못함 |
| 서브도메인을 옮기면 다시 로그인해야 함 | 의도한 동작 (쿠키 공유 안 함) |
| `/administrator` 같은 경로가 차단됨 | `startsWith('/admin')` 사용 → `isUnder` 방식 사용 |

Related: 관리자 화면이 커지거나 데스크톱 레이아웃이 사용자 앱과 많이 달라지면 `apps/admin`(모노레포 안 두 번째 Next 앱)으로 분리할 수 있다. `packages/ui`·`tokens`는 그대로 공유한다.
