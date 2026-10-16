'use client';

import { Button, Modal, Notice } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { formatDateTime, formatTime, parseLocalDateTime } from '@/lib/format/datetime';
import type { MyApplication } from './types';

/**
 * M-예비 승격 · 1시간 이내 (Figma 209:3766). 갈게요(수락) / 이번엔 어려워요(거절, 패널티 없음).
 * 장애학생 정보는 수락 응답에만 오므로 여기서는 그리지 않는다. 목업의 "40분 남았어요"는 타이머가 필요해
 * 응답 마감 시각(promotionDeadline)으로 대신한다. Esc·닫기는 응답 없이 닫고 카드의 "응답하기"로 다시 연다.
 */
export function PromotionModal({
  application,
  submitting,
  error,
  onClose,
  onAccept,
  onDecline,
}: {
  application: MyApplication | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const description = application
    ? `${formatDateTime(parseLocalDateTime(application.startAt))}${
        application.promotionDeadline
          ? ` · ${formatTime(parseLocalDateTime(application.promotionDeadline))}까지 답해 주세요`
          : ''
      }`
    : undefined;

  return (
    <Modal
      open={application !== null}
      onClose={onClose}
      icon={<Icon name="check" />}
      title="예비에서 매칭됐어요"
      description={description}
      dismissOnBackdrop={false}
      actions={
        // 목업은 버튼이 세로로 두 줄 (209:3778)
        <div className="flex w-full flex-col gap-(--space-xs)">
          <Button className="w-full" inactive={submitting} onClick={onAccept}>
            갈게요 (매칭 확정)
          </Button>
          <Button variant="secondary" className="w-full" inactive={submitting} onClick={onDecline}>
            이번엔 어려워요
          </Button>
        </div>
      }
    >
      <div className="flex w-full flex-col gap-(--space-sm)">
        <Notice type="info" message="지금은 패널티 없이 거절할 수 있어요" />
        {error && <Notice type="error" message={error} />}
      </div>
    </Modal>
  );
}
