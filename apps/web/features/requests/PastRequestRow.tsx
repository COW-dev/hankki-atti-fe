import { StatusTag } from '@hankki/ui';
import { formatDate, formatDateTime, parseLocalDateTime } from '@/lib/format/datetime';
import { HELP_REQUEST_STATUS } from '@/lib/labels/help-request';
import type { MyHelpRequest } from './types';

// F-02 지난 신청 행 (Figma 204:2851). 이용 완료 후 24시간까지는 노쇼 신고 링크가 붙는다
export function PastRequestRow({
  request,
  onReportNoShow,
}: {
  request: MyHelpRequest;
  onReportNoShow: (request: MyHelpRequest) => void;
}) {
  const startAt = parseLocalDateTime(request.startAt);
  const status = HELP_REQUEST_STATUS[request.status];

  return (
    <li className="flex w-full items-center gap-(--space-sm) border-t border-(--color-border-default) py-4 first:border-t-0">
      <div className="flex min-w-px flex-1 flex-col items-start gap-0.5">
        <p className="typo-body-strong text-(--color-text-primary)">{formatDateTime(startAt)}</p>
        {request.noShowReportable && (
          <button
            type="button"
            aria-label={`${formatDate(startAt)} 도우미가 오지 않았나요?`}
            onClick={() => onReportNoShow(request)}
            className="typo-caption-strong min-h-(--control-height-sm) cursor-pointer text-(--color-text-brand) underline"
          >
            도우미가 오지 않았나요?
          </button>
        )}
      </div>
      <StatusTag tone={status.tone}>{status.label}</StatusTag>
    </li>
  );
}
