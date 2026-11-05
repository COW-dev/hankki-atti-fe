import type { ApplicationStatus, CancelReason } from '@/lib/labels/application';
import type { HelpRequestStatus } from '@/lib/labels/help-request';
import type { AccountStatus } from '@/lib/labels/student';

// GET /api/admin/helpers 항목 (AdminHelperResponseDto). 이메일·전화번호·카톡은 서버가 가려서 준다
export type AdminHelperSummary = {
  helperId: number;
  name: string;
  studentNo: string;
  maskedEmail: string;
  maskedPhone: string;
  maskedKakaoId: string;
  attiMember: boolean;
  joinedAt: string;
  status: AccountStatus;
  completedCount: number;
};

export type AdminHelperPage = {
  helpers: AdminHelperSummary[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

export type HelperFilter = {
  q: string;
  status: AccountStatus | '';
  attiMember: 'true' | 'false' | '';
  page: number;
};

// GET /api/admin/helpers/{id} (AdminHelperDetailResponseDto)
export type AdminHelperDetail = {
  helperId: number;
  name: string;
  studentNo: string;
  status: AccountStatus;
  attiMember: boolean;
  email: string;
  phone: string;
  kakaoId: string;
  joinedAt: string;
  summary: {
    matchedCount: number;
    completedCount: number;
    volunteerHours: number;
    canceledCount: number;
    noShowCount: number;
  };
};

export type VolunteerHourChange = {
  changeId: number;
  beforeHours: number | null;
  afterHours: number;
  reason: string;
  adminName: string;
  changedAt: string;
};

// GET /api/admin/helpers/{id}/activities 항목 — 매칭되거나 승격된 지원만 오고, 최근 식사부터다
export type AdminHelperActivity = {
  applicationId: number;
  helpRequestId: number;
  startAt: string;
  studentId: number;
  studentName: string;
  status: ApplicationStatus;
  cancelReason: CancelReason | null;
  cancelReasonDetail: string | null;
  canceledAt: string | null;
  minutesBeforeMeal: number | null;
  minutesAfterCompletion: number | null;
  afterAction: 'PROMOTED' | 'REOPENED' | null;
  promotedWaitingOrder: number | null;
  requestStatus: HelpRequestStatus;
  // 이용 완료·노쇼만 있다
  volunteerHours: number | null;
  // 최근순
  volunteerHourChanges: VolunteerHourChange[];
};

export type AdminHelperDeactivationTarget = {
  applicationId: number;
  helpRequestId: number;
  startAt: string;
  studentName: string;
  status: ApplicationStatus;
  waitingOrder: number | null;
};

// alreadyInactive면 targets는 그때 정리되지 못하고 남은 건이다 — 비활성화를 다시 보내면 정리된다
export type AdminHelperDeactivationPreview = {
  helperId: number;
  alreadyInactive: boolean;
  matchedCount: number;
  waitingCount: number;
  targets: AdminHelperDeactivationTarget[];
};

export type AdminHelperDeactivation = {
  helperId: number;
  status: AccountStatus;
  deactivatedAt: string;
  releasedMatchCount: number;
  releasedWaitingCount: number;
  // 0보다 크면 같은 요청을 다시 보내 정리한다
  remainingCount: number;
};

export type AdminHelperAccountStatus = { helperId: number; status: AccountStatus };

export type AdminHelperTemporaryPassword = { helperId: number; email: string };

export type AdminVolunteerHours = {
  applicationId: number;
  volunteerHours: number;
  change: VolunteerHourChange;
};
