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
