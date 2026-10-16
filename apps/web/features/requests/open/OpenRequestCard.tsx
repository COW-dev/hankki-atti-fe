import { Button, StatusTag } from '@hankki/ui';
import { formatDateTime, formatTimeRange, parseLocalDateTime } from '@/lib/format/datetime';
import { APPLY_OUTCOME, BLOCK_REASON_LABEL, helpTypesText } from '@/lib/labels/help-request';
import type { OpenHelpRequest } from '../types';

/**
 * F-06 블라인드 카드 (Figma 208:3618 바로 매칭 · 208:3626 예비 등록 · 208:3634 지원 불가).
 * 서버가 준 필드만 그린다 — 장애학생 정보·메모는 매칭 전에 오지 않는다 (블라인드는 서버 책임).
 * 지원 불가 카드는 숨기지 않고 버튼 대신 사유를 보여 준다.
 */
export function OpenRequestCard({
  request,
  applying,
  onApply,
}: {
  request: OpenHelpRequest;
  applying: boolean;
  onApply: (request: OpenHelpRequest) => void;
}) {
  const startAt = parseLocalDateTime(request.startAt);
  const endAt = parseLocalDateTime(request.endAt);
  const outcome = APPLY_OUTCOME[request.applyOutcome];
  const blocked = request.applyOutcome === 'BLOCKED';

  return (
    <li className="flex w-full flex-col gap-1.5 border-t border-(--color-border-default) py-4 first:border-t-0">
      <div>
        <StatusTag type={outcome.tone}>{outcome.label}</StatusTag>
      </div>
      <h3
        className={`typo-title w-full ${blocked ? 'text-(--color-text-secondary)' : 'text-(--color-text-primary)'}`}
      >
        {formatTimeRange(startAt, endAt)}
      </h3>
      {blocked ? (
        <p className="typo-body w-full text-(--color-text-secondary)">
          {request.blockReason
            ? BLOCK_REASON_LABEL[request.blockReason]
            : '지금은 지원할 수 없어요'}
        </p>
      ) : (
        <div className="flex w-full flex-wrap items-center justify-between gap-(--space-sm)">
          <p className="typo-body min-w-px flex-1 text-(--color-text-secondary)">
            {helpTypesText(request.helpTypes)}
          </p>
          {outcome.action && (
            <Button
              variant="secondary"
              size="small"
              inactive={applying}
              aria-label={`${formatDateTime(startAt)} ${outcome.action}`}
              onClick={() => onApply(request)}
            >
              {outcome.action}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
