import type { ReactNode } from 'react';
import { Icon } from '@hankki/icons';

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

const STATUS_ICON: Partial<Record<StatusTagType, string>> = {
  success: 'status-success',
  progress: 'status-progress',
  ended: 'status-ended',
  error: 'status-error',
  warning: 'status-warning',
};

/** Figma StatusTag (1:1139). 상태 문구는 호출부에서 주고 원본 아이콘을 기본으로 쓰고 icon 슬롯으로 교체할 수 있다. */
export function StatusTag({
  type,
  children,
  icon,
}: {
  type: StatusTagType;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const iconName = STATUS_ICON[type];
  const statusIcon =
    icon ?? (iconName ? <Icon name={iconName} size="var(--font-caption)" /> : null);
  return (
    <span
      className={`typo-caption-strong inline-flex items-center gap-(--space-2xs) rounded-(--radius-sm) px-(--space-xs) py-(--space-2xs) ${LOOK[type]}`}
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
