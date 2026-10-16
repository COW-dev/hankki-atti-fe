'use client';

import { Button, Modal, Notice } from '@hankki/ui';
import { formatDateTime, parseLocalDateTime } from '@/lib/format/datetime';
import { applicationStatusLabel } from '@/lib/labels/application';
import type { MyApplication } from './types';

/**
 * M-예비 빠지기 (Figma 209:3856). 패널티는 없지만 되돌릴 수 없는 동작이라 제목에 포커스하고
 * 배경 클릭으로는 닫지 않는다.
 */
export function LeaveWaitingModal({
  application,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  application: MyApplication | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const description = application
    ? `${formatDateTime(parseLocalDateTime(application.startAt))} · ${applicationStatusLabel(
        'WAITING',
        application.waitingOrder,
      )}`
    : undefined;

  return (
    <Modal
      open={application !== null}
      onClose={onClose}
      title="예비에서 빠질까요?"
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
            onClick={onSubmit}
          >
            빠지기
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-(--space-sm)">
        <p className="typo-caption text-(--color-text-secondary)">
          예비는 패널티 없이 빠질 수 있어요
        </p>
        {error && <Notice type="error" message={error} />}
      </div>
    </Modal>
  );
}
