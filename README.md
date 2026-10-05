# 한끼아띠 프론트엔드

명지대학교 장애학생지원센터 · 장애학생 서포터즈 "아띠"와 함께 만드는 장애학생 식사 도우미 매칭 서비스의 사용자 앱(모바일 웹)입니다.

- 기술: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · pnpm
- 디자인: Figma "10 목업" · 디자인 시스템 정리 [docs/design-system.md](docs/design-system.md)
- 작업 규칙: [AGENTS.md](AGENTS.md)

## 시작하기

```bash
pnpm install
cp .env.example .env.local      # 백엔드 주소 (기본 http://localhost:8080)
bash scripts/setup-hooks.sh     # Git 훅 (main 직접 커밋 차단 · 시크릿 차단)
pnpm dev                        # http://localhost:3000
```

백엔드는 [hankki-atti-be](https://github.com/COW-dev/hankki-atti-be)에서 `./gradlew bootRun`으로 띄웁니다.

## 명령어

| 명령 | 내용 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm check` | 린트 + 포맷 검사 + 타입 검사 + 테스트 (커밋 전) |
| `pnpm test` | 테스트 |
| `pnpm build` | 프로덕션 빌드 |
