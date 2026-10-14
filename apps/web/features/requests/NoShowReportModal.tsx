'use client';

import { Button, Modal, Notice } from '@hankki/ui';
import { formatDateTime, parseLocalDateTime } from '@/lib/format/datetime';
import type { MyHelpRequest } from './types';

/**
 * M-노쇼 신고 (Figma 207:1921). 신고하기는 파괴적 동작이라 자동 포커스하지 않고(제목에 포커스),
 * 실수로 닫히지 않게 배경 클릭으로는 닫지 않는다.
 */
export function NoShowReportModal({
  request,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  request: MyHelpRequest | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (request: MyHelpRequest) => void;
}) {
  const description = request
    ? `${formatDateTime(parseLocalDateTime(request.startAt))}${request.helper ? ` · 도우미 ${request.helper.name}` : ''}`
    : undefined;
  const deadline = request?.noShowDeadline
    ? `${formatDateTime(parseLocalDateTime(request.noShowDeadline))}까지 신고할 수 있어요`
    : '이용 후 24시간까지 신고할 수 있어요';

  return (
    <Modal
      open={request !== null}
      onClose={onClose}
      title="도우미가 오지 않았나요?"
      description={description}
      dismissOnBackdrop={false}
      actions={
        <>
          <Button variant="secondary" size="small" onClick={onClose}>
            돌아가기
          </Button>
          <Button
            variant="danger"
            size="small"
            inactive={submitting}
            onClick={() => request && onSubmit(request)}
          >
            신고하기
          </Button>
        </>
      }
    >
      <p className="typo-caption text-(--color-text-secondary)">{deadline}</p>
      <Notice tone="warning">신고하면 노쇼로 기록되고 도우미 봉사시간에서 빠져요</Notice>
      {error && <Notice tone="error">{error}</Notice>}
    </Modal>
  );
}
