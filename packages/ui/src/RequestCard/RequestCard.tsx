import { useId, type ComponentProps } from 'react';
import { StatusTag } from '../StatusTag';
import { Button } from '../Button';

type RequestCardProps = {
  title: string;
  meta: string;
  status: ComponentProps<typeof StatusTag>['type'];
  statusLabel: string;
  partner?: string;
  action?: { label: string; onClick: () => void; inactive?: boolean; describedBy?: string };
};

/** Figma RequestCard (1:1340). 받은 표시 정보만 그리며 목록에서는 호출부가 ul/li로 감싼다. */
export function RequestCard({
  title,
  meta,
  status,
  statusLabel,
  partner,
  action,
}: RequestCardProps) {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="flex w-full flex-col items-start gap-(--space-sm) rounded-(--radius-lg) border-(length:--stroke-default) border-(--color-border-default) bg-(--color-bg-default) p-(--space-lg)"
    >
      <StatusTag type={status}>{statusLabel}</StatusTag>
      <h2 id={titleId} className="typo-title w-full text-(--color-text-primary)">
        {title}
      </h2>
      <p className="typo-body w-full text-(--color-text-secondary)">{meta}</p>
      {partner && <p className="typo-body-strong w-full text-(--color-text-primary)">{partner}</p>}
      {action && (
        <Button
          variant="tertiary"
          className="w-full"
          aria-label={`${title} 신청 ${action.label}`}
          aria-describedby={action.describedBy}
          inactive={action.inactive}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </article>
  );
}
