import type { AuthRequest } from '@/features/requests/api';
import type {
  AdminHelpRequest,
  AdminHelpRequestSummary,
  AdminStudentPage,
  HelpRequestFilter,
  StudentFilter,
} from './types';

// 장애학생 목록 한 페이지 (page는 0부터, 20명씩). 빈 조건은 보내지 않는다 —
// 제한 권한이 장애 유형을 보내면 서버가 403으로 막는다
export function fetchStudents(
  authRequest: AuthRequest,
  filter: StudentFilter,
): Promise<AdminStudentPage> {
  const params = new URLSearchParams({ page: String(filter.page) });
  const q = filter.q.trim();
  if (q) params.set('q', q);
  if (filter.status) params.set('status', filter.status);
  if (filter.disabilityType) params.set('disabilityType', filter.disabilityType);
  return authRequest<AdminStudentPage>(`/api/admin/students?${params}`);
}

// 전체 신청 현황 (식사 일시 오름차순, 페이지 없음). 상태·검색어는 있을 때만 보낸다
export function fetchHelpRequests(
  authRequest: AuthRequest,
  filter: HelpRequestFilter,
): Promise<AdminHelpRequest[]> {
  const params = new URLSearchParams({ from: filter.from, to: filter.to });
  if (filter.status) params.set('status', filter.status);
  const q = filter.q.trim();
  if (q) params.set('q', q);
  return authRequest<AdminHelpRequest[]>(`/api/admin/help-requests?${params}`);
}

// 요약 숫자는 기간만 받는다
export function fetchHelpRequestSummary(
  authRequest: AuthRequest,
  from: string,
  to: string,
): Promise<AdminHelpRequestSummary> {
  const params = new URLSearchParams({ from, to });
  return authRequest<AdminHelpRequestSummary>(`/api/admin/help-requests/summary?${params}`);
}
