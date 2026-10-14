import type { ReactNode } from 'react';
import { Icon } from '@hankki/icons';

export type NoticeTone = 'info' | 'success' | 'error' | 'warning';
const BACKGROUND: Record<NoticeTone, string> = {
  info: 'bg-(--color-bg-muted)',
  success: 'bg-(--color-bg-success-subtle)',
  error: 'bg-(--color-bg-danger-subtle)',
  warning: 'bg-(--color-bg-warning-subtle)',
};

/** Figma Notice (1:1207). 오류는 즉시, 그 밖의 안내는 정중하게 알린다. */
export function Notice({
  type,
  tone,
  message,
  children,
  live,
  className,
}: {
  type?: NoticeTone;
  tone?: NoticeTone;
  message?: string;
  children?: ReactNode;
  live?: boolean;
  className?: string;
}) {
  const kind = type ?? tone ?? 'info';
  return (
    <div
      role={kind === 'error' ? 'alert' : (live ?? type !== undefined) ? 'status' : undefined}
      className={`flex w-full items-start gap-(--space-sm) rounded-(--radius-sm) px-(--space-md) py-(--space-sm) ${BACKGROUND[kind]} ${className ?? ''}`}
    >
      <Icon name={kind === 'error' ? 'error' : `notice-${kind}`} />
      <p className="typo-body min-w-px flex-1 text-(--color-text-primary)">{message ?? children}</p>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return <Notice type="error" message={message} />;
}
