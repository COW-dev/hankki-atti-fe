#!/usr/bin/env bash
# 이미지를 띄워 Host별 라우팅과 정적 파일을 확인한다 (.github/workflows/ci.yml의 docker job에서 사용)
# 사용: smoke-test.sh <이미지> [호스트 포트]
set -euo pipefail

image="$1"
port="${2:-3000}"
base="http://127.0.0.1:$port"
name="hankki-atti-fe-smoke-$$"
failed=0

MAIN=atti.bluerack.org
HELPER=helper.atti.bluerack.org
ADMIN=admin.atti.bluerack.org

trap 'docker rm -f "$name" > /dev/null 2>&1 || true' EXIT
docker run -d --name "$name" -p "$port:3000" "$image" > /dev/null

ready=false
for _ in $(seq 1 30); do
    if curl -fs -o /dev/null "$base/"; then
        ready=true
        break
    fi
    if [ "$(docker inspect -f '{{.State.Running}}' "$name")" != "true" ]; then
        break
    fi
    sleep 1
done
if [ "$ready" != "true" ]; then
    echo "::error::컨테이너가 기동하지 않았다"
    docker logs "$name"
    exit 1
fi

check() {
    local label="$1" expected="$2" actual="$3"
    if [ "$actual" = "$expected" ]; then
        echo "ok   $label: $actual"
    else
        echo "::error::$label: 기대값 '$expected', 실제 '$actual'"
        failed=1
    fi
}

status() {
    curl -s -o /dev/null -w '%{http_code}' -H "Host: $1" "$base$2"
}

check "메인 / " 200 "$(status "$MAIN" /)"
check "메인 /matches (도우미 화면 아님)" 404 "$(status "$MAIN" /matches)"
check "메인 /admin 상태" 307 "$(status "$MAIN" /admin)"
check "메인 /admin 이동 위치" / "$(curl -s -o /dev/null -D - -H "Host: $MAIN" "$base/admin" \
    | tr -d '\r' | awk 'tolower($1) == "location:" { print $2 }')"
check "메인 /helper/matches (도우미 화면)" 200 "$(status "$MAIN" /helper/matches)"
check "기존 도우미 /matches 상태" 307 "$(status "$HELPER" /matches)"
check "기존 도우미 /matches 이동 위치" "https://$MAIN/helper/matches" "$(curl -s -o /dev/null -D - -H "Host: $HELPER" "$base/matches" \
    | tr -d '\r' | awk 'tolower($1) == "location:" { print $2 }')"
check "관리자 제목" '<title>한끼아띠 관리자</title>' "$(curl -s -H "Host: $ADMIN" "$base/" \
    | grep -o '<title>[^<]*</title>' | head -n 1)"

check "아이콘 응답" 200 "$(status "$MAIN" /icons/alert.svg)"
if curl -s -H "Host: $MAIN" "$base/icons/alert.svg" | cmp -s - packages/icons/svg/alert.svg; then
    echo "ok   아이콘 내용이 원본과 같다"
else
    echo "::error::아이콘 내용이 원본과 다르다"
    failed=1
fi

if [ "$(docker exec "$name" id -u)" = "0" ]; then
    echo "::error::root로 실행 중이다"
    failed=1
else
    echo "ok   비루트 실행: uid $(docker exec "$name" id -u)"
fi

# 브라우저가 백엔드를 절대 주소로 부르면 같은 출처 구조가 깨진다
if docker exec "$name" grep -rlq 'localhost:8080' apps/web/.next/static; then
    echo "::error::클라이언트 번들에 localhost:8080이 있다 (NEXT_PUBLIC_API_BASE_URL이 비어 있지 않음)"
    failed=1
else
    echo "ok   클라이언트 번들에 localhost:8080 없음"
fi

if [ "$failed" -ne 0 ]; then
    docker logs "$name"
fi
exit "$failed"
