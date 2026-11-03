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
