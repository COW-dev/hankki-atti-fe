import type { ReactNode } from 'react';

/**
 * OptionTile 묶음. fieldset + legend로 그룹 이름을 읽어 준다. Figma는 2열 그리드·간격 8, 목록형 화면은 1열.
 */
export function OptionGroup({
  legend,
  columns = 2,
  describedBy,
  children,
  className,
  legendClassName,
}: {
  legend: string;
  columns?: 1 | 2;
  describedBy?: string;
  children: ReactNode;
  className?: string;
  // 화면 필드 제목(typo-label 등)에 맞출 때
  legendClassName?: string;
}) {
  return (
    <fieldset aria-describedby={describedBy} className={`w-full min-w-0 ${className ?? ''}`}>
      <legend
        className={`mb-(--space-xs) w-full text-(--color-text-primary) ${legendClassName ?? 'typo-body-strong'}`}
      >
        {legend}
      </legend>
      <div className={`grid gap-(--space-xs) ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {children}
      </div>
    </fieldset>
  );
}
