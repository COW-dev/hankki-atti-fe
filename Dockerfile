# syntax=docker/dockerfile:1

# 빌드 스테이지는 대상 플랫폼과 무관하게 러너 아키텍처에서 한 번만 돈다.
# 결과물은 JS라 아키텍처와 무관하다. 네이티브 모듈은 sharp뿐인데 next/image를 쓰지 않아 실행 중에 불러오지 않는다
FROM --platform=$BUILDPLATFORM node:24-slim AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Seoul

# pnpm 버전은 package.json의 packageManager를 따른다.
# lockfile만으로 내려받아 의존성 레이어를 소스 변경과 분리한다
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile

# NEXT_PUBLIC_*는 빌드 때 번들에 박힌다. 브라우저는 같은 출처의 /api를 부르므로 API 주소는 빈 문자열이다.
# 사이트 주소는 워크플로우(.github/workflows/ci.yml) 한 곳에서만 정하므로 여기에 기본값을 두지 않는다
ARG NEXT_PUBLIC_API_BASE_URL=""
ARG NEXT_PUBLIC_SITE_URL
RUN test -n "$NEXT_PUBLIC_SITE_URL" || { echo "NEXT_PUBLIC_SITE_URL build arg가 필요하다" >&2; exit 1; }
RUN NEXT_OUTPUT_STANDALONE=true pnpm build

# standalone은 public·static을 복사하지 않는다. public/icons는 심링크라 실제 파일로 풀어서 복사한다
RUN cp -RL apps/web/public apps/web/.next/standalone/apps/web/public \
    && cp -R apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Seoul \
    PORT=3000

COPY --from=build --chown=1000:1000 /app/apps/web/.next/standalone ./

# 이미지의 node 사용자. 쿠버네티스 runAsNonRoot는 숫자 UID만 확인할 수 있어 이름 대신 숫자로 적는다
USER 1000:1000
EXPOSE 3000

# server.js는 HOSTNAME에 바인딩하는데, 쿠버네티스는 이 값을 파드 이름으로 덮어쓴다. 실행할 때 고정한다
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node apps/web/server.js"]
