'use client';

import { useId, useState } from 'react';
import { Button, Modal, Notice, OptionTileGroup, TextField } from '@hankki/ui';
import { formatDateTime, parseLocalDateTime } from '@/lib/format/datetime';
import {
  CANCEL_REASONS,
  CANCEL_REASON_LABEL,
  type SelectableCancelReason,
} from '@/lib/labels/application';
import type { CancelApplicationBody, MyApplication } from './types';

// 기타 사유 최대 길이 (백엔드 HelperCancelRequestDto reasonDetail maxLength)
const REASON_DETAIL_MAX = 200;

const REASON_OPTIONS = CANCEL_REASONS.map((reason) => ({
  value: reason,
  label: CANCEL_REASON_LABEL[reason],
}));

/**
 * M-취소 사유 선택 (도우미) (Figma 209:3662). 취소하기는 파괴적 동작이라 제목에 포커스하고(Modal 기본),
 * 실수로 닫히지 않게 배경 클릭으로는 닫지 않는다. 사유를 고르기 전에는 취소하기를 inactive로 두고 이유를 읽어 준다.
 * 사유·기타 내용 상태는 모달 안에 두고, 호출부가 대상이 바뀔 때 key로 초기화한다.
 */
export function CancelMatchModal({
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
  onSubmit: (body: CancelApplicationBody) => void;
}) {
  const [reason, setReason] = useState<SelectableCancelReason | null>(null);
  const [detail, setDetail] = useState('');
  const hintId = useId();

  const detailTrimmed = detail.trim();
  const detailTooLong = detailTrimmed.length > REASON_DETAIL_MAX;
  // 못 누르는 이유 (aria-describedby로 읽어 준다)
  const blocked =
    reason === null
      ? '취소 사유를 골라 주세요'
      : reason === 'OTHER' && detailTrimmed.length === 0
        ? '기타 사유를 적어 주세요'
        : detailTooLong
          ? `기타 사유는 ${REASON_DETAIL_MAX}자까지 쓸 수 있어요`
          : null;

  const description = application
    ? `${formatDateTime(parseLocalDateTime(application.startAt))}${
        application.student ? ` · 장애학생 ${application.student.name}` : ''
      }`
    : undefined;

  const submit = () => {
    if (!reason || blocked) return;
    onSubmit(reason === 'OTHER' ? { reason, reasonDetail: detailTrimmed } : { reason });
  };

  return (
    <Modal
      open={application !== null}
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
            inactive={submitting || blocked !== null}
            aria-describedby={blocked ? hintId : undefined}
            onClick={submit}
          >
            취소하기
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-(--space-sm)">
        <Notice
          type="warning"
          message="인정 사유가 아니면 봉사시간 불인정 등 패널티가 있을 수 있어요"
        />
        <div className="h-0.5" />
        <p className="typo-label text-(--color-text-primary)">취소 사유 (필수)</p>
        <OptionTileGroup
          label="취소 사유"
          columns={1}
          options={REASON_OPTIONS}
          value={reason ?? ''}
          onChange={(value) => setReason(value as SelectableCancelReason)}
        />
        {reason === 'OTHER' && (
          <TextField
            multiline
            rows={2}
            label="기타 사유"
            count={REASON_DETAIL_MAX}
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="취소하게 된 이유를 적어 주세요"
          />
        )}
        <p className="typo-caption text-(--color-text-secondary)">
          사유 목록은 센터 확인 전 예시예요
        </p>
        {blocked && (
          <p id={hintId} className="sr-only">
            {blocked}
          </p>
        )}
        {error && <Notice type="error" message={error} />}
      </div>
    </Modal>
  );
}
