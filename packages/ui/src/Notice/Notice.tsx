import { Icon } from '@hankki/icons';

type NoticeType = 'info' | 'success' | 'error' | 'warning';
const BACKGROUND: Record<NoticeType, string> = {
  info: 'bg-(--color-bg-muted)',
  success: 'bg-(--color-bg-success-subtle)',
  error: 'bg-(--color-bg-danger-subtle)',
  warning: 'bg-(--color-bg-warning-subtle)',
};

/** Figma Notice (1:1207). 오류는 즉시, 그 밖의 안내는 정중하게 알린다. */
export function Notice({ type = 'info', message }: { type?: NoticeType; message: string }) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex w-full items-start gap-(--space-sm) rounded-(--radius-sm) px-(--space-md) py-(--space-sm) ${BACKGROUND[type]}`}
    >
      <Icon name={type === 'error' ? 'error' : `notice-${type}`} />
      <p className="typo-body min-w-px flex-1 text-(--color-text-primary)">{message}</p>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return <Notice type="error" message={message} />;
}
