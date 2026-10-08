import { Button, StatusTag } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { formatDate, parseLocalDateTime, relativeMealLabel } from '@/lib/format/datetime';
import { HELP_REQUEST_STATUS, helpTypesText } from '@/lib/labels/help-request';
import { requestTitle } from './RequestDateTime';
import type { MyHelpRequest } from './types';

/**
 * F-02 다가오는 신청 카드 (Figma 204:2820 모집 중 · 204:2832 매칭 완료). RequestCard(70:142) 설명대로
 * 상태 태그 → 일시 → 도움 유형 → 상대 정보 → 동작 순서. 매칭 취소 버튼은 BE-24(매칭 취소 API) 뒤에 붙인다.
 */
export function UpcomingRequestCard({
  request,
  isNext,
  now,
  withdrawing,
  onWithdraw,
}: {
  request: MyHelpRequest;
  // 첫 카드: "오늘 저녁 · 다음 식사" 안내
  isNext: boolean;
  now: Date;
  withdrawing: boolean;
  onWithdraw: (request: MyHelpRequest) => void;
}) {
  const startAt = parseLocalDateTime(request.startAt);
  const status = HELP_REQUEST_STATUS[request.status];

  return (
    <li className="flex w-full flex-col gap-1.5 border-t border-(--color-border-default) py-4 first:border-t-0">
      {isNext && (
        <p className="typo-caption-strong text-(--color-text-brand)">
          {relativeMealLabel(startAt, now)} · 다음 식사
        </p>
      )}
      <div className="flex flex-wrap items-center gap-(--space-xs)">
        <StatusTag tone={status.tone}>{status.label}</StatusTag>
        {request.helperChanged && <StatusTag tone="neutral">도우미 바뀜</StatusTag>}
      </div>
      <h3 className="typo-title w-full text-(--color-text-primary)">{requestTitle(request)}</h3>
      {request.status === 'RECRUITING' ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-(--space-sm)">
          <p className="typo-body min-w-px flex-1 text-(--color-text-secondary)">
            {helpTypesText(request.helpTypes, request.otherHelpText)}
          </p>
          <Button
            variant="secondary"
            size="small"
            inactive={withdrawing}
            aria-label={`${formatDate(startAt)} 신청 철회`}
            onClick={() => onWithdraw(request)}
          >
            신청 철회
          </Button>
        </div>
      ) : (
        <>
          <p className="typo-body w-full text-(--color-text-secondary)">
            {helpTypesText(request.helpTypes, request.otherHelpText)}
          </p>
          {request.helper && (
            <p className="mt-0.5 flex min-h-(--control-height-sm) w-full flex-wrap items-center gap-(--space-xs) rounded-(--radius-md) bg-(--color-bg-muted) px-(--space-sm) py-(--space-xs)">
              <Icon name="user" size="calc(var(--font-caption) * 9 / 7)" />
              <span className="typo-caption-strong text-(--color-text-primary)">
                {request.helper.name}
              </span>
              <span className="typo-caption text-(--color-text-secondary)">
                카톡 {request.helper.kakaoId}
              </span>
            </p>
          )}
        </>
      )}
    </li>
  );
}
