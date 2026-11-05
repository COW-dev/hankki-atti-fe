'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { Button, ErrorNotice, Modal, TextField } from '@hankki/ui';
import { formatVolunteerHours } from '@/features/matches/past-note';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useAuth } from '@/lib/auth/AuthProvider';
import { formatDotMonthDay, formatTime, parseLocalDateTime } from '@/lib/format/datetime';
import { activityTag, mealAt } from './activity';
import { updateVolunteerHours, volunteerHoursFailureMessage } from './api';
import type { AdminHelperActivity, VolunteerHourChange } from './types';
import {
  MAX_VOLUNTEER_HOURS,
  MIN_VOLUNTEER_HOURS,
  VOLUNTEER_HOURS_STEP,
  VOLUNTEER_REASON_MAX,
  clampVolunteerHours,
  volunteerHoursBlockReason,
} from './volunteer-hours';

/**
 * 봉사시간 수정 (A-10, Figma 14:2816). 전체 권한만 열 수 있다 — 서버도 403으로 막는다.
 * 표에는 "수정됨"만 보여 수정 내역(전·후 시간, 관리자, 시각, 사유)은 여기서 보여 준다
 */
export function VolunteerHoursModal({
  activity,
  onClose,
  onSaved,
  onStale,
}: {
  activity: AdminHelperActivity;
  onClose: () => void;
  onSaved: () => void;
  onStale: () => void;
}) {
  const { authRequest } = useAuth();
  const currentHours = activity.volunteerHours ?? 0;
  const [hours, setHours] = useState(currentHours);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labelId = useId();
  const blockId = useId();
  const blockReason = volunteerHoursBlockReason(hours, currentHours, reason);
  const lastChange = activity.volunteerHourChanges[0];

  const step = (delta: number) => setHours((value) => clampVolunteerHours(value + delta));

  const onKeyDown = (event: KeyboardEvent) => {
    const next = {
      ArrowUp: hours + VOLUNTEER_HOURS_STEP,
      ArrowDown: hours - VOLUNTEER_HOURS_STEP,
      Home: MIN_VOLUNTEER_HOURS,
      End: MAX_VOLUNTEER_HOURS,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setHours(clampVolunteerHours(next));
  };

  const save = async () => {
    if (blockReason || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateVolunteerHours(authRequest, activity.applicationId, hours, reason);
      onSaved();
    } catch (cause) {
      setError(volunteerHoursFailureMessage(cause));
      setSubmitting(false);
      // 다른 관리자가 먼저 고친 경우라 표를 최신 값으로 맞춘다
      if (
        cause instanceof ApiError &&
        cause.code === ErrorCode.APPLICATION_VOLUNTEER_HOURS_UNCHANGED
      ) {
        onStale();
      }
    }
  };

  return (
    <Modal
      open
      title="봉사시간 수정"
      description={`${mealAt(activity.startAt)} · ${activity.studentName} · ${activityTag(activity.status).label}`}
      onClose={onClose}
      className="max-w-120!"
      actions={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="small" onClick={onClose}>
            취소
          </Button>
          <Button
            size="small"
            inactive={blockReason !== null || submitting}
            aria-describedby={blockReason ? blockId : undefined}
            onClick={save}
          >
            저장
          </Button>
          {blockReason && (
            <span id={blockId} className="sr-only">
              {blockReason}
            </span>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <p id={labelId} className="typo-label text-(--color-text-primary)">
            봉사시간
          </p>
          <div className="flex-1" />
          <Button
            variant="secondary"
            size="small"
            className="px-0!"
            aria-label="봉사시간 0.5시간 줄이기"
            inactive={hours <= MIN_VOLUNTEER_HOURS}
            onClick={() => step(-VOLUNTEER_HOURS_STEP)}
          >
            −
          </Button>
          <div
            role="spinbutton"
            tabIndex={0}
            aria-labelledby={labelId}
            aria-valuenow={hours}
            aria-valuemin={MIN_VOLUNTEER_HOURS}
            aria-valuemax={MAX_VOLUNTEER_HOURS}
            aria-valuetext={formatVolunteerHours(hours)}
            onKeyDown={onKeyDown}
            className="typo-body-strong flex min-h-(--control-height) w-18 items-center justify-center rounded-(--radius-control) bg-(--color-bg-muted) text-(--color-text-primary)"
          >
            {hours}
          </div>
          <Button
            variant="secondary"
            size="small"
            className="px-0!"
            aria-label="봉사시간 0.5시간 늘리기"
            inactive={hours >= MAX_VOLUNTEER_HOURS}
            onClick={() => step(VOLUNTEER_HOURS_STEP)}
          >
            +
          </Button>
          <p className="typo-caption text-(--color-text-secondary)">시간 (기본 1시간)</p>
        </div>
        <TextField
          label="수정 사유 *"
          placeholder="실제 도움 시간이 30분 길었어요"
          count={VOLUNTEER_REASON_MAX}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        {lastChange && (
          <p className="typo-caption text-(--color-text-secondary)">{changeText(lastChange)}</p>
        )}
        <p className="typo-caption text-(--color-text-secondary)">
          수정한 관리자와 시각이 기록에 남고 합계가 다시 계산돼요
        </p>
        {error && <ErrorNotice message={error} />}
      </div>
    </Modal>
  );
}

// 서버 문구 형식 "수정됨 · 1시간 → 1.5시간 · 관리자 · 일시"에 사유를 더한다. 처음 값이 없으면 수정 후 값만 적는다
function changeText(change: VolunteerHourChange): string {
  const date = parseLocalDateTime(change.changedAt);
  const after = formatVolunteerHours(change.afterHours);
  const hours =
    change.beforeHours === null ? after : `${formatVolunteerHours(change.beforeHours)} → ${after}`;
  const at = `${formatDotMonthDay(date)} ${formatTime(date)}`;
  return `최근 수정 · ${hours} · ${change.adminName} · ${at} · ${change.reason}`;
}
