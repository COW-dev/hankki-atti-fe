import { Button, StatusTag } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import {
  formatDateTime,
  formatDateTimeRange,
  formatTime,
  parseLocalDateTime,
} from '@/lib/format/datetime';
import { APPLICATION_STATUS, applicationStatusLabel } from '@/lib/labels/application';
import { helpTypesText } from '@/lib/labels/help-request';
import type { MyApplication } from './types';
import type { ApplicationAction } from './useMyApplications';

// 상태별 동작 버튼 (목업 237:6301 "취소하기" · 237:6308 "예비 빠지기", 승격 응답 대기는 목업에 카드가 없어 같은 모양)
const ACTION: Record<
  'MATCHED' | 'WAITING' | 'PROMOTION_PENDING',
  { action: ApplicationAction; label: string; name: string }
> = {
  MATCHED: { action: 'cancel', label: '취소하기', name: '매칭 취소하기' },
  WAITING: { action: 'leave', label: '예비 빠지기', name: '예비 빠지기' },
  PROMOTION_PENDING: { action: 'promotion', label: '응답하기', name: '승격 응답하기' },
};

/**
 * F-07 진행 중 카드 (Figma 208:3386 매칭 완료 · 208:3408 예비). 읽는 순서는 상태 태그 → 일시 → 도움 유형 → 상대 정보 → 버튼.
 * 서버가 준 필드만 그린다 — 장애학생 이름·카톡 ID는 매칭 완료에만 온다 (블라인드는 서버 책임).
 * 목업의 "특이사항" 줄은 API에 없어 그리지 않는다.
 */
export function InProgressApplicationCard({
  application,
  busy,
  onAction,
}: {
  application: MyApplication;
  busy: boolean;
  onAction: (action: ApplicationAction, application: MyApplication) => void;
}) {
  const startAt = parseLocalDateTime(application.startAt);
  const endAt = parseLocalDateTime(application.endAt);
  const status = APPLICATION_STATUS[application.status];
  const action =
    application.status === 'MATCHED' ||
    application.status === 'WAITING' ||
    application.status === 'PROMOTION_PENDING'
      ? ACTION[application.status]
      : null;
  const button = action && (
    <Button
      variant="secondary"
      size="small"
      inactive={busy}
      aria-label={`${formatDateTime(startAt)} ${action.name}`}
      onClick={() => onAction(action.action, application)}
    >
      {action.label}
    </Button>
  );

  return (
    <li className="flex w-full flex-col gap-1.5 border-t border-(--color-border-default) py-4 first:border-t-0">
      <div>
        <StatusTag type={status.type}>
          {applicationStatusLabel(application.status, application.waitingOrder)}
        </StatusTag>
      </div>
      <h3 className="typo-title w-full text-(--color-text-primary)">
        {formatDateTimeRange(startAt, endAt)}
      </h3>
      {application.student ? (
        <>
          <p className="typo-body w-full text-(--color-text-secondary)">
            {helpTypesText(application.helpTypes)}
          </p>
          {/* 상대 정보 + 버튼 (208:3399). 큰 글씨에서는 버튼이 아래로 내려간다 */}
          <div className="mt-0.5 flex w-full flex-wrap items-center gap-(--space-xs)">
            <p className="flex min-h-(--control-height-sm) min-w-px flex-1 flex-wrap items-center gap-(--space-xs) rounded-(--radius-md) bg-(--color-bg-muted) px-(--space-sm) py-(--space-xs)">
              <Icon name="user" size="calc(var(--font-caption) * 15 / 14)" />
              <span className="typo-caption-strong text-(--color-text-primary)">
                {application.student.name}
              </span>
              <span className="typo-caption text-(--color-text-secondary)">
                카톡 {application.student.kakaoId}
              </span>
            </p>
            {button}
          </div>
        </>
      ) : (
        <>
          {application.status === 'PROMOTION_PENDING' && application.promotionDeadline && (
            <p className="typo-caption w-full text-(--color-text-brand)">
              {formatTime(parseLocalDateTime(application.promotionDeadline))}까지 답해 주세요
            </p>
          )}
          <div className="flex w-full flex-wrap items-center justify-between gap-(--space-sm)">
            <p className="typo-body min-w-px flex-1 text-(--color-text-secondary)">
              {helpTypesText(application.helpTypes)}
            </p>
            {button}
          </div>
        </>
      )}
    </li>
  );
}
