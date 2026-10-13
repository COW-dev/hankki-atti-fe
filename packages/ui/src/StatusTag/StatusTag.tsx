import type { ReactNode } from 'react';

type StatusTagType = 'success' | 'progress' | 'ended' | 'error' | 'warning' | 'info' | 'neutral';
const LOOK: Record<StatusTagType, string> = {
  success: 'bg-(--color-bg-success-subtle) text-(--color-text-success)',
  progress: 'bg-(--color-bg-muted) text-(--color-text-brand)',
  ended: 'bg-(--color-bg-muted) text-(--color-text-secondary)',
  error: 'bg-(--color-bg-danger-subtle) text-(--color-text-danger)',
  warning: 'bg-(--color-bg-warning-subtle) text-(--color-text-warning)',
  info: 'bg-(--color-bg-muted) text-(--color-text-brand)',
  neutral: 'bg-(--color-bg-muted) text-(--color-text-secondary)',
};

/** Figma StatusTag (87:4810). 상태 문구는 호출부에서 주고 원본 아이콘은 icon 슬롯에 넣는다. */
export function StatusTag({
  type,
  children,
  icon,
}: {
  type: StatusTagType;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`typo-caption-strong inline-flex items-center gap-(--space-2xs) rounded-(--radius-sm) px-(--space-xs) py-(--space-2xs) ${LOOK[type]}`}
    >
      {icon && (
        <span
          aria-hidden
          className="inline-flex shrink-0"
          style={{ width: 'var(--font-caption)', height: 'var(--font-caption)' }}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
