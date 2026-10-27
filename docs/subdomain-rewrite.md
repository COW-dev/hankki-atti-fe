---
title: Next.js 서브도메인 분리 (rewrite 방식)
date: 2026-10-27
tags: [nextjs, spring, nginx, docker, subdomain]
aliases: [서브도메인 분리, admin 서브도메인]
---

# Next.js 서브도메인 분리 (rewrite 방식)

> 작성: 2026-10-27 · 기준 브랜치: main · 기준 HEAD: 1079279
> 계획 문서다. 프론트 작업이 병합되고 백엔드·인프라 체크리스트가 끝나면 상단에 `✅ 완료 (날짜, PR)` 배너를 달고, 영구 규칙(서브도메인 구조·API 주소 설정)은 AGENTS.md로 옮긴 뒤 이 문서를 삭제한다.

`apps/web` 하나의 Next.js 앱에서 `helper.domain.com`(도우미)과 `admin.domain.com`(관리자)을 분리한다. 메인 도메인은 장애학생·비로그인.
`apps/web/proxy.ts`가 host를 읽어 경로 앞에 폴더명을 붙여 **rewrite**하고, App Router는 그 경로로 페이지를 고른다.

## 결정 사항

| 항목 | 결정 (2026-10-27) |
|---|---|
| 관리자 화면 위치 | 이 레포 `app/admin/`. 지금은 권한 가드·로그인 뼈대만, 목업이 정해지면 채운다 |
| 도우미 서브도메인 | 분리한다 — `app/helper/` (요청 목록·매칭 현황·로그인) |
| 로그인 쿠키 공유 | 공유하지 않음. refresh 쿠키 domain 생략, 도메인마다 한 역할만 로그인 (`lib/site.ts` `SITE_ROLE`) |
| 운영 도메인 | **미정** — DNS·인증서 발급과 `NEXT_PUBLIC_SITE_URL`에 필요 |

## 배경: 왜 rewrite인가

- App Router는 **경로(path)만** 보고 페이지를 고른다. host는 보지 않는다.
  `domain.com/users`와 `admin.domain.com/users`는 둘 다 `/users`로 같은 페이지가 된다.
- 그래서 proxy가 host 정보를 경로로 바꿔 준다.
  `admin.domain.com/users` → (rewrite) → `/admin/users` → `app/admin/users/page.tsx`
- **redirect가 아니라 rewrite**를 쓴다. 주소창은 `admin.domain.com/users` 그대로 두고, 서버 내부에서만 `/admin/users`를 렌더링한다.

## 목표 구조

```
브라우저 → Nginx (80/443)
            ├─ /api/*  → backend (hankki-atti-be, :8080)
            └─ 나머지  → frontend (apps/web, :3000) → proxy.ts가 서브도메인 분기
```

모든 서브도메인에서 `/api`가 같은 출처가 되므로 운영 환경에서 CORS가 필요 없다.

```
apps/web/
├─ proxy.ts               ← Next.js 16 규칙 (middleware.ts는 deprecated). app/과 같은 위치
└─ app/
   ├─ page.tsx            → domain.com/ (소개)
   ├─ login/, requests/, requests/new/, password/change/   → 장애학생
   ├─ helper/
   │  ├─ page.tsx         → helper.domain.com/ (→ /matches)
   │  ├─ login/, requests/, matches/
   └─ admin/
      ├─ layout.tsx       ← robots noindex
      ├─ page.tsx         → admin.domain.com/ (useSessionGuard('ADMIN'))
      └─ login/
```

---

## 1. 프론트엔드 (apps/web)

### 1-1. proxy.ts

- `apps/web/proxy.ts` — Next 16 규칙 (근거: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). host·경로 판단은 `apps/web/lib/site.ts`의 `resolveSiteRoute`로 빼서 `site.test.ts`로 검증한다 (`/administrator`는 막지 않음 포함)
- 다른 도메인으로 가는 링크(메인 → 도우미 회원가입)는 `siteUrl('helper', '/signup')`. `NEXT_PUBLIC_SITE_URL`(메인 주소) 앞에 서브도메인을 붙인다

### 1-2. 체크리스트

- [x] `apps/web/proxy.ts` + `lib/site.ts`·테스트
- [x] `app/helper/`, `app/admin/` 생성. 서브도메인 안의 링크에는 접두사를 붙이지 않는다 (예: `<Link href="/matches">`)
- [x] 로그인 화면을 `features/auth/LoginScreen`으로 빼고 도메인 역할(`role`)을 받는다. 다른 역할 계정은 로그아웃 후 안내 (안내 문구는 목업에 없어 임시)
- [x] `useSessionGuard`는 역할 하나만 받고, 다른 역할이면 로그아웃 → `/login` (다른 역할의 홈이 이 도메인에 없어 리다이렉트 루프가 생긴다)
- [ ] 운영 배포 시 `NEXT_PUBLIC_SITE_URL`을 운영 메인 주소로 (빌드 시점 값)
- [ ] API 주소: 지금은 `apps/web/lib/api/client.ts`가 `NEXT_PUBLIC_API_BASE_URL`(절대 주소)로 호출한다
  - 운영(Nginx 같은 출처): 빌드 시 `NEXT_PUBLIC_API_BASE_URL=`(빈 문자열)로 두면 `/api/...` 상대경로가 된다 (`??`라 빈 문자열은 기본값으로 바뀌지 않음)
  - 로컬: 기존대로 `http://localhost:8080`. 이때는 백엔드 CORS 허용 목록이 필요하다 (2장)
  - 클라이언트 코드 변경 없음. `client.ts`의 토큰·쿠키 처리를 바꾸게 되면 사람 리뷰 필수 (AGENTS.md 절대 규칙 5)
- 서버 컴포넌트에서 쿠키를 붙여 API를 부르는 방식은 **쓰지 않는다**. access 토큰은 메모리에만 있고 호출은 `authRequest`로만 한다
- [x] 권한 확인은 각 페이지의 `useSessionGuard(역할)` (proxy만으로 막지 않는다. 최종 권한 판단은 서버). `homePathOf('ADMIN')`은 `/`
- [x] `app/admin/layout.tsx`에 `robots: noindex`
- [x] AGENTS.md "사용자와 화면"·디렉토리 구조 갱신
- [x] `pnpm build` 후 Host 헤더별 확인: 메인 `/matches` 404, `helper.` `/matches` 200, `admin.` 관리자 제목, 메인 `/admin` → `/` 307

### 1-3. 후속 (이번 범위 밖)

Figma 근거는 `14Pknotxq8Yi4F2eddqqGg` "real_page"(14:150) — 2026-10-28 확인.

- 도우미 로그인은 목업 "L-01 로그인 (도우미 흐름용)"(14:1231)이 장애학생 L-01(14:618)과 같다 → 공용 `LoginScreen`(L 크기) 그대로 쓴다
- 관리자 로그인은 별도 데스크톱 디자인 "AL-01 관리자 로그인"(14:1249 기본 · 14:1261 실패)이 있다. 지금 `app/admin/login`은 모바일 `LoginScreen`을 임시로 쓴다 → AL-01로 교체
- 관리자 화면 19장: AF-01 장애학생 등록, AF-02 장애학생 관리, AF-03 도우미 관리, AF-04 공지 관리 (section 14:1246)
- 도우미 회원가입 "L-02"(14:989 안내 자료 확인 · 14:1032 정보 입력) → `app/helper/signup`. 지금 링크는 404
- 비밀번호 재설정 "L-03"(14:665~14:730)은 아직 화면이 없다. helper에서도 필요
- `/password/change`는 메인에만 있다. 도우미·관리자 계정이 비밀번호 변경 요구를 받으면 갈 화면이 없다 (지금은 센터 발급 계정 = 장애학생만 해당)
- 다른 역할 계정으로 로그인했을 때의 문구는 목업에 없다 — 지금 문구는 임시

---

## 2. 백엔드 (hankki-atti-be)

이 레포 밖 작업이다. 백엔드 담당과 맞춘다.

- [ ] 컨트롤러 경로가 `/api/...`로 통일돼 있는지 확인 (Nginx가 `/api` 접두사를 그대로 전달)
- [ ] `application.yml`에 프록시 헤더 신뢰 설정
  ```yaml
  server:
    forward-headers-strategy: framework
  ```
- [ ] Security 권한 설정 (Origin이 아니라 사용자 권한으로 판단)
  ```java
  .requestMatchers("/api/admin/**").hasRole("ADMIN")
  ```
- [ ] 로컬 개발용 CORS 허용 목록에 `http://helper.localhost:3000`, `http://admin.localhost:3000` 추가 (`allowCredentials(true)`라 `*` 금지)
- [ ] refresh 토큰 쿠키: domain을 **생략**한다 (서브도메인 간 공유 안 함, 2026-10-27 결정). `httpOnly`, `secure`, `sameSite("Lax")`
  - 백엔드가 Nginx 뒤에서 같은 출처로 응답하므로 host-only 쿠키가 각 서브도메인에 따로 붙는다

---

## 3. 인프라 (Nginx, Docker, DNS)

이 레포에는 nginx·compose 파일이 없다. 배포 설정이 있는 곳에서 작업한다. 아래는 기준안이다.

### 3-1. nginx/default.conf

```nginx
server {
    listen 80;
    server_name domain.com helper.domain.com admin.domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name domain.com helper.domain.com admin.domain.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    proxy_set_header Host              $host;   # 빠지면 서브도메인 분기 전체가 동작하지 않음
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location /api/ {
        proxy_pass http://backend:8080;   # 끝에 / 없음 → /api 접두사 유지
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3-2. docker-compose.yml (변경 포인트)

```yaml
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/nginx/certs:ro
    depends_on: [frontend, backend]

  frontend:
    build:
      context: ./hankki-atti-fe
      args:
        - NEXT_PUBLIC_API_BASE_URL=   # 빌드 시점에 박히므로 environment가 아니라 build arg
        - NEXT_PUBLIC_SITE_URL=https://domain.com
    expose: ["3000"]

  backend:
    build: ./hankki-atti-be
    expose: ["8080"]
```

### 3-3. 체크리스트

- [ ] DNS에 `helper`, `admin` A 레코드 추가 — 사람이 직접
- [ ] SSL 인증서 재발급: `-d domain.com -d helper.domain.com -d admin.domain.com` (와일드카드는 DNS 인증만 가능)
- [ ] Nginx `server_name`, `proxy_set_header Host $host`, `/api/` → backend, `/` → frontend 확인
- [ ] compose에서 frontend/backend를 `ports` 대신 `expose`로
- [ ] `docker compose up -d --build`

---

## 작업 순서

1. 결정 사항 확정 (운영 도메인만 남음).
2. 프론트: 완료 (1-2 체크리스트). 후속은 1-3.
3. 백엔드·인프라는 각 저장소에서 진행한다. DNS, 인증서, 쿠키 공유 여부는 사람이 한다.

## 트러블슈팅

| 증상 | 원인 |
|---|---|
| admin 도메인인데 메인 페이지가 나옴 | Nginx `Host` 헤더 누락, 또는 matcher가 경로를 제외함 |
| 주소창에 `/admin`이 보임 | rewrite 대신 redirect 사용, 또는 링크에 `/admin` 접두사 포함 |
| 운영에서 API가 `localhost:8080`으로 감 | 빌드 시 `NEXT_PUBLIC_API_BASE_URL`을 비우지 않음 (런타임 env로는 안 바뀜) |
| 서브도메인을 옮기면 다시 로그인해야 함 | 의도한 동작 (쿠키 공유 안 함) |
| 한 서브도메인 로그인이 다른 쪽에 이어짐 | 백엔드가 refresh 쿠키에 `.domain.com`을 지정함 → 생략으로 변경 |
| 리다이렉트가 http로 감 | Spring `forward-headers-strategy` 누락 |
| `/administrator` 같은 경로가 차단됨 | `startsWith('/admin')` 사용 → `isUnder` 방식 사용 |

Related: 대안으로 관리자 앱을 `apps/admin`으로 분리(모노레포 안 두 번째 Next 앱)할 수 있다. `packages/ui`·`tokens`를 그대로 공유하므로, 관리자 화면이 커지거나 데스크톱 전용 레이아웃이 사용자 앱과 많이 달라지면 이쪽이 낫다.
