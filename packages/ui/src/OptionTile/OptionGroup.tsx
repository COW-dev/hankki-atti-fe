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
}: {
  legend: string;
  columns?: 1 | 2;
  describedBy?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset aria-describedby={describedBy} className={`w-full min-w-0 ${className ?? ''}`}>
      <legend className="typo-body-strong mb-(--space-xs) w-full text-(--color-text-primary)">
        {legend}
      </legend>
      <div className={`grid gap-(--space-xs) ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {children}
      </div>
    </fieldset>
  );
}
