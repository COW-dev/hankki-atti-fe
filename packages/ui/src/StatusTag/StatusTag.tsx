import type { ReactNode } from 'react';
import { Icon } from '@hankki/icons';

export type StatusTone =
  'success' | 'progress' | 'ended' | 'error' | 'warning' | 'info' | 'neutral';
const LOOK: Record<StatusTone, string> = {
  success: 'bg-(--color-bg-success-subtle) text-(--color-text-success)',
  progress: 'bg-(--color-bg-muted) text-(--color-text-brand)',
  ended: 'bg-(--color-bg-muted) text-(--color-text-secondary)',
  error: 'bg-(--color-bg-danger-subtle) text-(--color-text-danger)',
  warning: 'bg-(--color-bg-warning-subtle) text-(--color-text-warning)',
  info: 'bg-(--color-bg-muted) text-(--color-text-brand)',
  neutral: 'bg-(--color-bg-muted) text-(--color-text-secondary)',
};

const STATUS_ICON: Partial<Record<StatusTone, string>> = {
  success: 'status-success',
  progress: 'status-progress',
  ended: 'status-ended',
  error: 'status-error',
  warning: 'status-warning',
};

/** Figma StatusTag (1:1139). 상태 문구는 호출부에서 주고 원본 아이콘을 기본으로 쓰고 icon 슬롯으로 교체할 수 있다. */
export function StatusTag({
  type,
  tone,
  className,
  children,
  icon,
}: {
  type?: StatusTone;
  tone?: StatusTone;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const kind = type ?? tone ?? 'neutral';
  const iconName = STATUS_ICON[kind];
  const statusIcon =
    icon ?? (iconName ? <Icon name={iconName} size="var(--font-caption)" /> : null);
  return (
    <span
      className={`typo-caption-strong inline-flex items-center gap-(--space-2xs) rounded-(--radius-sm) px-(--space-xs) py-(--space-2xs) ${LOOK[kind]} ${className ?? ''}`}
    >
      {statusIcon && (
        <span
          aria-hidden
          className="inline-flex shrink-0"
          style={{ width: 'var(--font-caption)', height: 'var(--font-caption)' }}
        >
          {statusIcon}
        </span>
      )}
      {children}
    </span>
  );
}
