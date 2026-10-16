'use client';

import { Button, Modal, Notice } from '@hankki/ui';
import { formatDateTime, parseLocalDateTime } from '@/lib/format/datetime';
import { helpTypesText } from '@/lib/labels/help-request';
import type { OpenHelpRequest } from '../types';

// 결과를 미리 알린다 (명세 "카드에 바로 매칭 / 예비 등록 표시"를 모달에서도 — 목업 209:3459에는 없는 줄)
const OUTCOME_NOTE = {
  MATCH: '지금 지원하면 바로 매칭돼요',
  WAITING: '이미 지원한 도우미가 있어 예비로 등록돼요',
  BLOCKED: null,
} as const;

/**
 * M-지원 확인 (Figma 209:3459). 지원하기는 되돌리기 어려운 동작이라 제목에 포커스하고(Modal 기본),
 * 실수로 닫히지 않게 배경 클릭으로는 닫지 않는다.
 */
export function ApplyConfirmModal({
  request,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  request: OpenHelpRequest | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const description = request
    ? `${formatDateTime(parseLocalDateTime(request.startAt))} · ${helpTypesText(request.helpTypes)}`
    : undefined;
  const note = request ? OUTCOME_NOTE[request.applyOutcome] : null;

  return (
    <Modal
      open={request !== null}
      onClose={onClose}
      title="이 요청에 지원할까요?"
      description={description}
      dismissOnBackdrop={false}
      actions={
        <>
          <Button variant="secondary" className="min-w-0 flex-1" onClick={onClose}>
            닫기
          </Button>
          <Button className="min-w-0 flex-1" inactive={submitting} onClick={onSubmit}>
            지원하기
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-(--space-sm)">
        {note && <p className="typo-body text-(--color-text-primary)">{note}</p>}
        <Notice type="warning" message="매칭 뒤 취소하거나 나오지 않으면 패널티가 있을 수 있어요" />
        {error && <Notice type="error" message={error} />}
      </div>
    </Modal>
  );
}
