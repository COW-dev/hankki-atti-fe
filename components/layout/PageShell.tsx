import type { ReactNode } from "react";

// 크기 모드 (styles/tokens.css): 장애학생·비로그인 화면은 L, 도우미 화면은 M
export type SizeMode = "L" | "M";

/**
 * 모바일 웹 화면 틀: 상단 바 → 본문 → (남는 공간) → 푸터 → 탭바. 넓은 화면에서는 가운데 480px 열로 보인다.
 * 안에 있는 모든 컴포넌트의 글자·조작 영역 크기가 size를 따라 바뀐다.
 */
export function PageShell({
  size,
  topBar,
  children,
  footer,
  tabBar,
}: {
  size: SizeMode;
  topBar: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  tabBar?: ReactNode;
}) {
  return (
    <div data-size={size} className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-(--color-bg-subtle)">
      {topBar}
      <main className="flex w-full flex-col py-2.5">{children}</main>
      <div className="flex-1" />
      {footer}
      {tabBar}
    </div>
  );
}

// 흰 배경 묶음 (Figma "Block" — 모바일은 좌우 끝까지, 블록 사이 회색 띠 10)
export function Block({ children, gap = "sm" }: { children: ReactNode; gap?: "sm" | "md" }) {
  return (
    <section
      className={`flex w-full flex-col items-start bg-(--color-bg-default) p-(--space-lg) ${gap === "md" ? "gap-(--space-md)" : "gap-(--space-sm)"}`}
    >
      {children}
    </section>
  );
}
