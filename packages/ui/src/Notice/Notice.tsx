import type { ReactNode } from 'react';
import { Icon } from '@hankki/icons';

export type NoticeTone = 'info' | 'success' | 'error' | 'warning';

// Info는 민트 배경 없이 bg/muted + 브랜드색 아이콘 (2026-10-01 개정). 오류 아이콘은 TextField와 같은 error.svg
const TONE: Record<NoticeTone, { className: string; icon: string }> = {
  info: { className: 'bg-(--color-bg-muted)', icon: 'notice-info' },
  success: { className: 'bg-(--color-bg-success-subtle)', icon: 'notice-success' },
  error: { className: 'bg-(--color-bg-danger-subtle)', icon: 'error' },
  warning: { className: 'bg-(--color-bg-warning-subtle)', icon: 'notice-warning' },
};

/**
 * Figma Notice (70:77) — Info · Success · Error · Warning 안내 박스.
 * 오류는 스크린리더가 바로 읽도록 role="alert". 완료 문구처럼 조용히 알릴 건 live로 role="status".
 * 요약처럼 정적인 안내는 role 없이 그냥 둔다.
 */
export function Notice({
  tone = 'info',
  live = false,
  children,
  className,
}: {
  tone?: NoticeTone;
  live?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const role = tone === 'error' ? 'alert' : live ? 'status' : undefined;
  return (
    <div
      role={role}
      className={`flex w-full items-start gap-(--space-sm) rounded-(--radius-sm) px-(--space-md) py-(--space-sm) ${TONE[tone].className} ${className ?? ''}`}
    >
      <Icon name={TONE[tone].icon} />
      <div className="typo-body min-w-px flex-1 text-(--color-text-primary)">{children}</div>
    </div>
  );
}

// 화면 상단 오류 안내 (로그인 실패 등). Notice tone="error"와 같다
export function ErrorNotice({ message }: { message: string }) {
  return <Notice tone="error">{message}</Notice>;
}
