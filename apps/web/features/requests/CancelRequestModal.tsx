'use client';

import { Button, Modal, Notice } from '@hankki/ui';
import { formatDateTime, parseLocalDateTime } from '@/lib/format/datetime';
import type { MyHelpRequest } from './types';

/**
 * M-취소 확인 (장애학생) (Figma 207:1856 · Dialog 207:1911). 명세 "매칭 취소 (학생)": 사유 입력 없음, 패널티 없음.
 * 취소하기는 파괴적 동작이라 자동 포커스하지 않고(제목에 포커스), 실수로 닫히지 않게 배경 클릭으로는 닫지 않는다.
 */
export function CancelRequestModal({
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

  return (
    <Modal
      open={request !== null}
      onClose={onClose}
      title="매칭을 취소할까요?"
      description={description}
      dismissOnBackdrop={false}
      actions={
        <>
          <Button variant="secondary" size="small" className="min-w-0 flex-1" onClick={onClose}>
            돌아가기
          </Button>
          <Button
            variant="danger"
            size="small"
            className="min-w-0 flex-1"
            inactive={submitting}
            onClick={() => request && onSubmit(request)}
          >
            취소하기
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-(--space-sm)">
        <p className="typo-caption text-(--color-text-secondary)">
          취소하면 도우미에게 바로 알려요
        </p>
        {error && <Notice type="error" message={error} />}
      </div>
    </Modal>
  );
}
