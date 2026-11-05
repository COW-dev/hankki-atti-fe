import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * 관리자 표 (real_page 14:1306 · 14:1596 · 14:1967 · 14:2076). 흰 블록 안의 고정 폭 표.
 * columns에는 머리 행의 th를 넣는다 — 열 폭은 화면마다 Figma 값을 th에 준다.
 * caption은 화면에 보이지 않고 표 이름으로 읽힌다.
 */
export function Table({
  caption,
  columns,
  children,
  ...props
}: ComponentProps<'div'> & { caption: string; columns: ReactNode }) {
  return (
    <div {...props} className="overflow-hidden rounded-(--radius-lg) bg-(--color-bg-default)">
      <table className="w-full table-fixed text-left">
        <caption className="sr-only">{caption}</caption>
        <thead className="typo-caption-strong bg-(--color-bg-muted) text-(--color-text-secondary)">
          <tr className="h-11 border-b border-(--color-border-default)">{columns}</tr>
        </thead>
        <tbody className="typo-body text-(--color-text-primary)">{children}</tbody>
      </table>
    </div>
  );
}

/** linked면 행 안의 TableRowLink 하나가 행 전체를 덮는다. */
export function TableRow({
  linked = false,
  className,
  ...props
}: ComponentProps<'tr'> & { linked?: boolean }) {
  return (
    <tr
      {...props}
      className={`h-13.5 border-b border-(--color-border-default) last:border-b-0 ${
        linked ? 'relative hover:bg-(--color-bg-subtle)' : ''
      } ${className ?? ''}`}
    />
  );
}

/** 행 전체를 누를 수 있게 링크를 행 위로 넓힌다. 행마다 하나만 둬 Tab이 행마다 한 번 멈춘다. */
export function TableRowLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} className="text-left after:absolute after:inset-0 after:content-['']" />;
}

export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-13.5 px-5 text-(--color-text-secondary)">
        {children}
      </td>
    </tr>
  );
}

/** 빈 칸 줄표는 "대시"로 읽히지 않게 숨기고 뜻을 읽어 준다. */
export function None({ label = '없음' }: { label?: string }) {
  return (
    <>
      <span aria-hidden>–</span>
      <span className="sr-only">{label}</span>
    </>
  );
}
