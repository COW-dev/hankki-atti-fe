import type { HelpType } from '@/lib/labels/help-request';
import type { ApplicationStatus, CancelReason } from '@/lib/labels/application';

// GET /api/applications/me 항목 (백엔드 MyApplicationResponseDto). 블라인드는 서버 책임 — 받은 필드만 그린다
export type MyApplication = {
  applicationId: number;
  helpRequestId: number;
  status: ApplicationStatus;
  startAt: string;
  endAt: string;
  helpTypes: HelpType[];
  // 예비일 때만. 앞 사람이 빠지면 당겨진다
  waitingOrder?: number;
  // 승격 응답 대기일 때만 (식사 15분 전, 그보다 늦게 승격됐으면 식사 시작)
  promotionDeadline?: string;
  // 매칭 완료일 때만
  student?: { name: string; kakaoId: string };
  // 내가 취소한 지원일 때만
  cancelReason?: CancelReason;
  // 이용 완료(1.0)·노쇼(0.0)일 때만
  volunteerHours?: number;
};

export type MyApplications = {
  // 매칭 완료·승격 응답 대기·예비, 식사 시각 가까운 순
  inProgress: MyApplication[];
  // 이용 완료·노쇼·취소·예비 종료·자동 제외·빠짐·승격 거절, 최근 순
  past: MyApplication[];
};

// 필터 칩 (Figma 208:3371): 전체 · 매칭 · 예비 · 지난 활동. API filter 값과 같다
export type ApplicationFilter = 'ALL' | 'MATCHED' | 'WAITING' | 'PAST';

// POST /api/applications/{id}/cancel 본문 — OTHER면 reasonDetail 필수 (200자)
export type CancelApplicationBody = {
  reason: Exclude<CancelReason, 'ADMIN_DEACTIVATED'>;
  reasonDetail?: string;
};
