import type { StatusTone } from '@hankki/ui';

// API는 enum 코드만 준다 (백엔드 ApplicationStatus·CancelReason). 도우미 지원(매칭 현황) 문구는 여기 한곳에서 매핑한다
export type ApplicationStatus =
  | 'MATCHED'
  | 'PROMOTION_PENDING'
  | 'WAITING'
  | 'WITHDRAWN'
  | 'EXCLUDED'
  | 'EXPIRED'
  | 'PROMOTION_DECLINED'
  | 'HELPER_CANCELED'
  | 'STUDENT_CANCELED'
  | 'COMPLETED'
  | 'NO_SHOW';
// ADMIN_DEACTIVATED는 관리자 비활성화로 기록되는 값이라 도우미가 고를 수 없다 (목록에 넣지 않는다)
export type CancelReason = 'ILLNESS' | 'ACADEMIC' | 'FAMILY' | 'OTHER' | 'ADMIN_DEACTIVATED';
export type SelectableCancelReason = Exclude<CancelReason, 'ADMIN_DEACTIVATED'>;

/**
 * F-07 태그 (Figma 208:3305 · StatusTag 68:92 설명: 성공=매칭 완료, 진행=예비, 종료=이용 완료·예비 종료·취소됨,
 * 경고=도우미 취소, 오류=노쇼). 예비 N번은 waitingOrder를 붙여야 해서 화면에서 label 뒤에 번호를 더한다.
 * 지난 활동 태그 문구는 목업(자동 제외·취소됨)을 따르고 뜻은 부가 문구로 채운다 (plan 확인 필요 4).
 */
export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; type: StatusTone }> = {
  MATCHED: { label: '매칭 완료', type: 'success' },
  PROMOTION_PENDING: { label: '승격 응답 대기', type: 'progress' },
  WAITING: { label: '예비', type: 'progress' },
  WITHDRAWN: { label: '빠짐', type: 'ended' },
  EXCLUDED: { label: '자동 제외', type: 'ended' },
  EXPIRED: { label: '예비 종료', type: 'ended' },
  PROMOTION_DECLINED: { label: '승격 거절', type: 'ended' },
  HELPER_CANCELED: { label: '취소', type: 'warning' },
  STUDENT_CANCELED: { label: '취소됨', type: 'ended' },
  COMPLETED: { label: '이용 완료', type: 'ended' },
  NO_SHOW: { label: '노쇼', type: 'error' },
};

// "예비 2번" — 순번이 없으면 "예비"
export function applicationStatusLabel(status: ApplicationStatus, waitingOrder?: number): string {
  if (status === 'WAITING' && waitingOrder !== undefined) return `예비 ${waitingOrder}번`;
  return APPLICATION_STATUS[status].label;
}

// 취소 사유 문구 (Figma 209:3672 OptionTile 4개). 센터 회신 전 임시 목록 (명세 "매칭 취소 (도우미)")
export const CANCEL_REASON_LABEL: Record<CancelReason, string> = {
  ILLNESS: '질병·부상',
  ACADEMIC: '학사 일정 변경 (시험·보강)',
  FAMILY: '가족 경조사',
  OTHER: '기타 (직접 입력)',
  ADMIN_DEACTIVATED: '관리자 비활성화',
};

// 취소 사유 선택지 순서 (목업 위에서 아래)
export const CANCEL_REASONS: readonly SelectableCancelReason[] = [
  'ILLNESS',
  'ACADEMIC',
  'FAMILY',
  'OTHER',
];
