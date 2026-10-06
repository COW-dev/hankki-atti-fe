# 한끼아띠 프론트엔드

명지대학교 장애학생지원센터 · 장애학생 서포터즈 "아띠"와 함께 만드는 장애학생 식사 도우미 매칭 서비스의 사용자 앱(모바일 웹)입니다.

- 기술: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · pnpm
- 디자인: Figma "10 목업" · 디자인 시스템 정리 [docs/design-system.md](docs/design-system.md)
- 작업 규칙: [AGENTS.md](AGENTS.md)

## 시작하기

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local      # 백엔드 주소 (기본 http://localhost:8080)
bash scripts/setup-hooks.sh     # Git 훅 (main 직접 커밋 차단 · 시크릿 차단)
pnpm exec playwright install chromium # Storybook 테스트 브라우저
pnpm dev                        # http://localhost:3000
```

백엔드는 [hankki-atti-be](https://github.com/COW-dev/hankki-atti-be)에서 `./gradlew bootRun`으로 띄웁니다.

## 명령어

| 명령 | 내용 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm check` | 린트 + 포맷 검사 + 타입 검사 + 테스트 (커밋 전) |
| `pnpm test` | 단위 + Storybook 브라우저 테스트 |
| `pnpm test:unit` | 단위 테스트만 |
| `pnpm test:storybook` | Storybook 상호작용·접근성 테스트 |
| `pnpm storybook` | Storybook (http://localhost:6006) |
| `pnpm build-storybook` | Storybook 정적 빌드 |
| `pnpm build` | 프로덕션 빌드 |

## 구조와 개발 기준

`apps/web`는 Next.js 사용자 앱, `packages/ui`는 공용 컴포넌트, `packages/tokens`는 토큰·텍스트 스타일·포커스, `packages/icons`는 Icon과 원본 SVG다. 루트의 명령어로 앱과 Storybook을 실행한다.

개발 시 [아키텍처](docs/ARCHITECTURE.md)와 [디자인 시스템](docs/design-system.md)을 함께 참고한다. 공유 패키지는 앱에 의존하지 않으며, 앱의 `@/`는 `apps/web`를 가리킨다. Storybook은 실제 구현을 가져오고 L·M·큰 글씨를 툴바에서 전환한다.

기존 루트 `.env.local`은 `apps/web/.env.local`로 옮긴다. 아이콘은 `packages/icons/svg`에서 관리하고 `apps/web/public/icons` 심링크를 통해 기존 URL을 유지한다. 배포 시 Next.js 앱 루트는 `apps/web`, lockfile과 설치 기준은 저장소 루트다.
