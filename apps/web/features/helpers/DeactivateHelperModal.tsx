'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, ErrorNotice, Modal, Notice } from '@hankki/ui';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import { deactivationImpact, deactivationTargetText } from './activity';
import { deactivateHelper, previewHelperDeactivation } from './api';
import type { AdminHelperDeactivationPreview, AdminHelperDetail } from './types';

/**
 * 도우미 비활성화 확인 (A-11, Figma 14:2837). 열리면 풀릴 매칭·예비를 미리 받는다.
 * 파괴적 버튼에 자동 포커스하지 않는다 (Modal이 제목에 둔다).
 * 서버가 일부를 처리하지 못하면(remainingCount) 계정은 이미 비활성이라 창을 열어 둔 채 다시 보내게 한다.
 * 창을 닫은 뒤에는 비활성 계정 상세의 "남은 N건 정리"로 다시 연다 — 같은 요청이 남은 건만 처리한다
 */
export function DeactivateHelperModal({
  helper,
  onClose,
  onDone,
  onPartial,
}: {
  helper: AdminHelperDetail;
  onClose: () => void;
  onDone: (message: string) => void;
  onPartial: () => void;
}) {
  const { authRequest } = useAuth();
  const cleanup = helper.status === 'INACTIVE';
  const nothingLeft = cleanup ? '남은 건이 없어요' : '이미 비활성화된 계정이에요';
  const [preview, setPreview] = useState<AdminHelperDeactivationPreview | null>(null);
  const [reload, setReload] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 부모가 렌더마다 새 함수를 넘겨도 미리보기를 한 번만 부르게 최신 콜백만 기억한다
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    let alive = true;
    previewHelperDeactivation(authRequest, helper.helperId).then(
      (result) => {
        if (!alive) return;
        // 다른 관리자가 먼저 비활성화했고 남은 건도 없으면 확인할 것이 없다
        if (result.alreadyInactive && result.targets.length === 0) {
          onDoneRef.current(nothingLeft);
        } else setPreview(result);
      },
      (cause: unknown) => {
        if (alive)
          setError(errorMessage(cause, '영향을 확인하지 못했어요. 잠시 후 다시 시도해 주세요'));
      },
    );
    return () => {
      alive = false;
    };
  }, [authRequest, helper.helperId, reload, nothingLeft]);

  const confirm = async () => {
    if (!preview || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await deactivateHelper(authRequest, helper.helperId);
      if (result.remainingCount === 0) {
        onDone(cleanup ? '남은 건을 정리했어요' : '계정을 비활성화했어요');
        return;
      }
      setError(`${result.remainingCount}건을 처리하지 못했어요. 다시 시도해 주세요`);
      setSubmitting(false);
      setReload((count) => count + 1);
      onPartial();
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === ErrorCode.HELPER_ALREADY_INACTIVE) {
        onDone(nothingLeft);
        return;
      }
      setError(
        errorMessage(
          cause,
          cleanup
            ? '남은 건을 정리하지 못했어요. 잠시 후 다시 시도해 주세요'
            : '계정을 비활성화하지 못했어요. 잠시 후 다시 시도해 주세요',
        ),
      );
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={
        cleanup
          ? `${helper.name} 도우미의 남은 건을 정리할까요?`
          : `${helper.name} 도우미 계정을 비활성화할까요?`
      }
      description={cleanup ? '이미 비활성화된 계정이에요' : '비활성화하면 로그인할 수 없어요'}
      onClose={onClose}
      className="max-w-130!"
      actions={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="small" onClick={onClose}>
            취소
          </Button>
          <Button variant="danger" size="small" inactive={!preview || submitting} onClick={confirm}>
            {cleanup ? '정리' : '비활성화'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {preview && <Notice tone="warning">{deactivationImpact(preview)}</Notice>}
        {preview && preview.targets.length > 0 && (
          <ul className="typo-body flex list-disc flex-col gap-3 pl-3.5 text-(--color-text-primary) marker:text-(--color-text-secondary)">
            {preview.targets.map((target) => (
              <li key={target.applicationId}>{deactivationTargetText(target)}</li>
            ))}
          </ul>
        )}
        {error && <ErrorNotice message={error} />}
        <p className="typo-caption text-(--color-text-secondary)">
          취소 사유는 &quot;관리자 비활성화&quot;로 기록되고 도우미 패널티 이력에는 넣지 않아요
        </p>
      </div>
    </Modal>
  );
}
