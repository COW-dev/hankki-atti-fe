import type { CancelReason } from '@/lib/labels/application';
import type { HelpRequestStatus, HelpType, RequestCancelType } from '@/lib/labels/help-request';
import type { AccountStatus, DisabilityType } from '@/lib/labels/student';

// GET /api/admin/students 항목 (AdminStudentSummaryResponseDto).
// 장애 유형·연락처는 전체 권한에게만 오고, 연락처는 서버가 일부 가려서 준다
export type AdminStudentSummary = {
  accountId: number;
  name: string;
  studentNo: string;
  disabilityType?: DisabilityType;
  schoolEmail?: string;
  phone?: string;
  kakaoId?: string;
  status: AccountStatus;
  // 가장 최근 신청의 식사 시작 시각 (LocalDateTime). 신청이 없으면 null
  recentRequestAt: string | null;
};

export type AdminStudentPage = {
  students: AdminStudentSummary[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

export type StudentFilter = {
  q: string;
  status: AccountStatus | '';
  disabilityType: DisabilityType | '';
  page: number;
};

// GET /api/admin/help-requests 항목 (AdminHelpRequestResponseDto · 제한 권한은 Limited — 장애 유형 없음).
// 시각은 모두 LocalDateTime 문자열
export type AdminHelpRequest = {
  id: number;
  startAt: string;
  endAt: string;
  status: HelpRequestStatus;
  helpTypes: HelpType[];
  cancelType: RequestCancelType | null;
  student: { id: number; name: string; studentNo: string; disabilityType?: DisabilityType };
  // 매칭 완료·이용 완료·노쇼일 때만 있다
  helper: { id: number; name: string } | null;
  promotionPending: boolean;
  helperChanged: boolean;
  waitingCount: number;
  requestedAt: string;
  firstMatchedAt: string | null;
  minutesToMatch: number | null;
};

// GET /api/admin/help-requests/summary — 기간 기준, 상태·검색과 상관없다
export type AdminHelpRequestSummary = {
  total: number;
  matched: number;
  recruiting: number;
  failed: number;
  noShow: number;
};

// from·to는 식사 날짜 "2026-10-12" (to 포함, 최대 31일)
export type HelpRequestFilter = {
  from: string;
  to: string;
  status: HelpRequestStatus | '';
  q: string;
};

// 계정정보 메일 상태 (백엔드 CredentialMailStatus). 메일은 서버가 따로 보내 등록 직후는 보통 PENDING이다
export type CredentialMailStatus = 'PENDING' | 'SENT' | 'FAILED';

// POST /api/admin/students 응답 (AdminStudentCreateResponseDto)
export type AdminStudentCreated = {
  accountId: number;
  loginId: string;
  name: string;
  studentNo: string;
  schoolEmail: string;
  disabilityType: DisabilityType;
  credentialMailStatus: CredentialMailStatus;
};

// POST /api/admin/students/{id}/credentials 응답 (AdminStudentCredentialMailResponseDto)
export type AdminStudentCredentialMail = {
  accountId: number;
  loginId: string;
  schoolEmail: string;
  credentialMailStatus: CredentialMailStatus;
};

// 상세 화면 위 프로필 (AdminStudentHeader). 장애 유형은 전체 권한에게만 온다
export type AdminStudentHeader = {
  id: number;
  name: string;
  studentNo: string;
  status: AccountStatus;
  disabilityType?: DisabilityType;
};

// GET /api/admin/students/{id} 정보 탭 (AdminStudentInfoResponseDto, 전체 권한만)
export type AdminStudentInfo = Required<AdminStudentHeader> & {
  phone: string;
  schoolEmail: string;
  kakaoId: string;
  loginId: string;
  accessibilityMode: boolean;
  registeredAt: string;
  credentialMailStatus: CredentialMailStatus;
  specialNote: string | null;
  smsConsentedAt: string | null;
};

// GET /api/admin/students/{id}/help-requests 한 줄 (최근 식사부터)
export type AdminStudentHelpRequest = {
  id: number;
  startAt: string;
  endAt: string;
  status: HelpRequestStatus;
  helpTypes: HelpType[];
  cancelType: RequestCancelType | null;
  helper: { id: number; name: string } | null;
  // 예비에서 승격된 도우미면 그때 순번. 기록 전 승격이면 promoted만 true
  promotedWaitingOrder: number | null;
  promoted: boolean;
  promotionPending: boolean;
  helperChanged: boolean;
  requestedAt: string;
  firstMatchedAt: string | null;
};

export type AdminStudentHistoryType = 'HELPER_CANCELED' | 'STUDENT_CANCELED' | 'NO_SHOW';

// GET /api/admin/students/{id}/histories 한 줄 (AdminStudentHistoryResponseDto)
export type AdminStudentHistory = {
  type: AdminStudentHistoryType;
  helpRequestId: number;
  startAt: string;
  helper: { id: number; name: string } | null;
  cancelReason: CancelReason | null;
  cancelReasonDetail: string | null;
  occurredAt: string;
  minutesBeforeMeal: number | null;
  minutesAfterCompletion: number | null;
  afterAction: 'PROMOTED' | 'REOPENED' | null;
  promotedHelper: { id: number; name: string } | null;
  promotedWaitingOrder: number | null;
  requestStatus: HelpRequestStatus;
};

export type AdminStudentHelpRequests = {
  student: AdminStudentHeader;
  helpRequests: AdminStudentHelpRequest[];
};

export type AdminStudentHistories = {
  student: AdminStudentHeader;
  histories: AdminStudentHistory[];
};

// GET /api/admin/students/{id}/deactivation-preview — 취소될 신청은 건수만 온다
export type AdminStudentDeactivationPreview = {
  accountId: number;
  alreadyInactive: boolean;
  activeRequestCount: number;
};

// POST …/deactivate · …/activate 응답
export type AdminStudentAccountStatus = {
  accountId: number;
  status: AccountStatus;
  deactivatedAt: string | null;
};
