'use client';

import { useId, useState } from 'react';
import { Button, ErrorNotice, Modal } from '@hankki/ui';
import { useAuth } from '@/lib/auth/AuthProvider';
import { deleteNotice, isNoticeGone, noticeDeleteFailureMessage } from './api';

/**
 * 공지 삭제 확인 (A-12, Figma 14:2854). 파괴적 버튼에 자동 포커스하지 않는다 (Modal이 제목에 둔다).
 * 다른 관리자가 먼저 지웠으면 목표는 이미 이뤄졌으므로 오류가 아니라 완료로 넘긴다
 */
export function DeleteNoticeModal({
  notice,
  onClose,
  onDone,
}: {
  notice: { noticeId: number; title: string };
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { authRequest } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deletingId = useId();

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteNotice(authRequest, notice.noticeId);
      onDone('공지를 삭제했어요');
    } catch (cause) {
      if (isNoticeGone(cause)) {
        onDone('이미 삭제된 공지예요');
        return;
      }
      setError(noticeDeleteFailureMessage(cause));
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`"${notice.title}"를 삭제할까요?`}
      description="삭제하면 되돌릴 수 없어요"
      onClose={() => {
        if (!submitting) onClose();
      }}
      className="max-w-120!"
      actions={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="small"
            inactive={submitting}
            aria-describedby={submitting ? deletingId : undefined}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="danger"
            size="small"
            inactive={submitting}
            aria-describedby={submitting ? deletingId : undefined}
            onClick={confirm}
          >
            삭제
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p id={deletingId} role="status" className="sr-only">
          {submitting && '공지를 삭제하고 있어요'}
        </p>
        {error && <ErrorNotice message={error} />}
        <p className="typo-caption text-(--color-text-secondary)">
          사용자 목록에서 바로 사라지고, 이미 받은 알림을 누르면 &quot;삭제된 공지예요&quot;라고
          안내돼요
        </p>
      </div>
    </Modal>
  );
}
