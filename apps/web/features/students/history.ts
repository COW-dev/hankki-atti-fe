import type { StatusTone } from '@hankki/ui';
import type { CancelReason } from '@/lib/labels/application';
import { HELP_REQUEST_STATUS } from '@/lib/labels/help-request';
import type {
  AdminStudentHelpRequest,
  AdminStudentHistory,
  AdminStudentHistoryType,
} from './types';

// 취소·노쇼 이력 구분 태그 (Figma 14:2094 도우미 취소 경고 · 14:2120 노쇼 오류 · 14:2133 학생 취소 종료)
export const HISTORY_TYPE_TAG: Record<
  AdminStudentHistoryType,
  { label: string; tone: StatusTone }
> = {
  HELPER_CANCELED: { label: '도우미 취소', tone: 'warning' },
  NO_SHOW: { label: '노쇼 신고', tone: 'error' },
  STUDENT_CANCELED: { label: '학생 취소', tone: 'ended' },
};

// 이력 표의 짧은 사유 (Figma 14:2098 "학사 일정 변경"). 도우미 선택지 문구(CANCEL_REASON_LABEL)는 괄호 설명이 붙어 따로 둔다
const HISTORY_REASON_LABEL: Record<CancelReason, string> = {
  ILLNESS: '질병·부상',
  ACADEMIC: '학사 일정 변경',
  FAMILY: '가족 경조사',
  OTHER: '기타',
  ADMIN_DEACTIVATED: '관리자 비활성화',
};

// 1560 → "26시간", 40 → "40분", 90 → "1시간 30분"
export function durationText(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}분`;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}

// 도우미 취소 사유 칸 (학생 이력과 도우미 활동 이력이 같이 쓴다)
export function helperCancelReasonText(reason: CancelReason, detail: string | null): string {
  const label = HISTORY_REASON_LABEL[reason];
  if (reason === 'OTHER') return detail ? `${label} · "${detail}"` : label;
  // 관리자 비활성화는 도우미가 고른 사유가 아니다
  if (reason === 'ADMIN_DEACTIVATED') return label;
  return `인정 사유 · ${label}`;
}

export function noShowReasonText(minutesAfterCompletion: number | null): string {
  return minutesAfterCompletion === null
    ? '학생 신고'
    : `학생 신고 (이용 후 ${durationText(minutesAfterCompletion)})`;
}

// 이력 문구는 Figma 14:2090~14:2141 예시를 따른다. 없는 칸은 null (화면이 "–"로 그린다)
export function historyReason(history: AdminStudentHistory): string | null {
  if (history.type === 'NO_SHOW') return noShowReasonText(history.minutesAfterCompletion);
  if (history.type !== 'HELPER_CANCELED' || !history.cancelReason) return null;
  return helperCancelReasonText(history.cancelReason, history.cancelReasonDetail);
}

export function historyTiming(history: AdminStudentHistory): string | null {
  return history.minutesBeforeMeal === null
    ? null
    : `식사 ${durationText(history.minutesBeforeMeal)} 전`;
}

// 패널티는 센터가 이력을 보고 판단한다 — 화면은 결과만 적는다 (A-06 명세)
export function historyAfter(history: AdminStudentHistory): string | null {
  if (history.type === 'NO_SHOW') return '봉사시간 제외';
  if (history.type === 'STUDENT_CANCELED') return '패널티 없음';
  if (history.afterAction === 'PROMOTED') {
    const order = history.promotedWaitingOrder ? `예비 ${history.promotedWaitingOrder}번` : '예비';
    return history.promotedHelper
      ? `${order}(${history.promotedHelper.name}) 승격`
      : `${order} 승격`;
  }
  if (history.afterAction === 'REOPENED') {
    return `모집 재개 → ${HELP_REQUEST_STATUS[history.requestStatus].label}`;
  }
  return null;
}

// 매칭현황 "예비 승격" 칸 (Figma 14:2016 "예비 1번 → 승격")
export function promotionText(request: AdminStudentHelpRequest): string | null {
  if (!request.promoted) return null;
  return request.promotedWaitingOrder
    ? `예비 ${request.promotedWaitingOrder}번 → 승격`
    : '예비 → 승격';
}
