import type { ReactNode } from 'react';

// 흰 배경 묶음 (Figma "Block" — 모바일은 좌우 끝까지, 블록 사이 회색 띠 10)
export function Block({ children, gap = 'sm' }: { children: ReactNode; gap?: 'sm' | 'md' }) {
  return (
    <section
      className={`flex w-full flex-col items-start bg-(--color-bg-default) p-(--space-lg) ${gap === 'md' ? 'gap-(--space-md)' : 'gap-(--space-sm)'}`}
    >
      {children}
    </section>
  );
}
