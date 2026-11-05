import type { StatusTone } from '@hankki/ui';
import { formatVolunteerHours } from '@/features/matches/past-note';
import {
  HISTORY_TYPE_TAG,
  durationText,
  helperCancelReasonText,
  noShowReasonText,
} from '@/features/students/history';
import { formatDotMonthDayWeekday, formatTime, parseLocalDateTime } from '@/lib/format/datetime';
import {
  APPLICATION_STATUS,
  applicationStatusLabel,
  type ApplicationStatus,
} from '@/lib/labels/application';
import { HELP_REQUEST_STATUS } from '@/lib/labels/help-request';
import type {
  AdminHelperActivity,
  AdminHelperDeactivationPreview,
  AdminHelperDeactivationTarget,
} from './types';

// "09.30(화) 12:00"
export function mealAt(value: string): string {
  const date = parseLocalDateTime(value);
  return `${formatDotMonthDayWeekday(date)} ${formatTime(date)}`;
}

// 관리자 표는 도우미 화면과 달리 누가 취소했는지 드러낸다 (Figma 14:2398 "도우미 취소" · 14:2446 "노쇼 신고")
export function activityTag(status: ApplicationStatus): { label: string; tone: StatusTone } {
  if (status === 'HELPER_CANCELED' || status === 'NO_SHOW' || status === 'STUDENT_CANCELED') {
    return HISTORY_TYPE_TAG[status];
  }
  const { label, type } = APPLICATION_STATUS[status];
  return { label, tone: type };
}

// 활동 문구는 Figma 14:2377~14:2455 예시를 따른다. 없는 칸은 null (화면이 "–"로 그린다)
export function activityReason(activity: AdminHelperActivity): string | null {
  if (activity.status === 'NO_SHOW') return noShowReasonText(activity.minutesAfterCompletion);
  if (activity.status !== 'HELPER_CANCELED' || !activity.cancelReason) return null;
  return helperCancelReasonText(activity.cancelReason, activity.cancelReasonDetail);
}

export function activityTiming(activity: AdminHelperActivity): string | null {
  return activity.minutesBeforeMeal === null
    ? null
    : `식사 ${durationText(activity.minutesBeforeMeal)} 전`;
}

export function activityAfter(activity: AdminHelperActivity): string | null {
  if (activity.status === 'NO_SHOW') return '봉사시간 제외';
  if (activity.status === 'STUDENT_CANCELED') return '패널티 없음';
  if (activity.afterAction === 'PROMOTED') {
    return activity.promotedWaitingOrder
      ? `예비 ${activity.promotedWaitingOrder}번 승격`
      : '예비 승격';
  }
  if (activity.afterAction === 'REOPENED') {
    const result =
      activity.requestStatus === 'MATCHED'
        ? '매칭'
        : HELP_REQUEST_STATUS[activity.requestStatus].label;
    return `모집 재개 → ${result}`;
  }
  return null;
}

// 서버는 이용 완료·노쇼에만 값을 준다. 도우미 취소는 목업대로 0시간으로 보인다 (Figma 14:2400)
export function activityHours(activity: AdminHelperActivity): string | null {
  if (activity.volunteerHours !== null) return formatVolunteerHours(activity.volunteerHours);
  return activity.status === 'HELPER_CANCELED' ? formatVolunteerHours(0) : null;
}

// Figma 14:2840
export function deactivationImpact(preview: AdminHelperDeactivationPreview): string {
  if (preview.targets.length === 0) return '풀릴 매칭·예비는 없어요';
  return `진행 중 매칭 ${preview.matchedCount}건, 예비 ${preview.waitingCount}건이 풀려요`;
}

// Figma 14:2843 매칭 · 14:2846 예비. 승격 응답 대기도 매칭처럼 다음 예비로 넘어간다
export function deactivationTargetText(target: AdminHelperDeactivationTarget): string {
  const at = mealAt(target.startAt);
  if (target.status === 'WAITING') {
    const order = applicationStatusLabel('WAITING', target.waitingOrder ?? undefined);
    return `${at} ${order} — 자리에서 빠지고 뒤 순번이 당겨져요`;
  }
  return `${at} ${target.studentName} — 예비 1번이 자동 승격돼요. 예비가 없으면 모집을 다시 열고 학생에게 알려요`;
}
