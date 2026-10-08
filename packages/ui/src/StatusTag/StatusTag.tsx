import type { ReactNode } from 'react';
import { Icon } from '@hankki/icons';

export type StatusTone =
  'success' | 'progress' | 'ended' | 'warning' | 'error' | 'info' | 'neutral';

// 색만으로 구분하지 않도록 상태 톤에는 아이콘을 함께 둔다. 정보·중립은 상태가 아니라 표시라 아이콘이 없다
const TONE: Record<StatusTone, { className: string; icon?: string }> = {
  success: {
    className: 'bg-(--color-bg-success-subtle) text-(--color-text-success)',
    icon: 'tag-success',
  },
  progress: { className: 'bg-(--color-bg-muted) text-(--color-text-brand)', icon: 'tag-progress' },
  ended: { className: 'bg-(--color-bg-muted) text-(--color-text-secondary)', icon: 'tag-ended' },
  warning: {
    className: 'bg-(--color-bg-warning-subtle) text-(--color-text-warning)',
    icon: 'tag-warning',
  },
  error: {
    className: 'bg-(--color-bg-danger-subtle) text-(--color-text-danger)',
    icon: 'tag-error',
  },
  info: { className: 'bg-(--color-bg-muted) text-(--color-text-brand)' },
  neutral: { className: 'bg-(--color-bg-muted) text-(--color-text-secondary)' },
};

/**
 * Figma StatusTag (68:92) — 성공(매칭 완료) · 진행(모집 중·예비) · 종료(이용 완료·취소됨) · 경고(매칭 실패) ·
 * 오류(노쇼) · 정보(고정·권한) · 중립(장애 유형·도우미 바뀜). 글자가 의미를 전하므로 role은 없다.
 */
export function StatusTag({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  const { className: toneClass, icon } = TONE[tone];
  return (
    <span
      className={`typo-caption-strong inline-flex items-center gap-(--space-2xs) rounded-(--radius-sm) px-(--space-xs) py-(--space-2xs) whitespace-nowrap ${toneClass} ${className ?? ''}`}
    >
      {/* Figma 아이콘 14 = caption 14. 글자 크기를 따라가게 caption 변수로 맞춘다 */}
      {icon && <Icon name={icon} size="var(--font-caption)" />}
      {children}
    </span>
  );
}
