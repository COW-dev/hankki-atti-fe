import type { AuthRequest } from '@/features/requests/api';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import {
  toStudentCreateRequest,
  type StudentCreateField,
  type StudentCreateForm,
} from './create-form';
import type {
  AdminHelpRequest,
  AdminHelpRequestSummary,
  AdminStudentCreated,
  AdminStudentCredentialMail,
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

// AF-01 장애학생 등록 — 서버가 초기 비밀번호를 만들어 학교 이메일로 보낸다 (화면에는 비밀번호가 오지 않는다)
export function createStudent(
  authRequest: AuthRequest,
  form: StudentCreateForm,
): Promise<AdminStudentCreated> {
  return authRequest<AdminStudentCreated>('/api/admin/students', {
    method: 'POST',
    body: toStudentCreateRequest(form),
  });
}

export type StudentCreateFailure = { field?: StudentCreateField; message: string };

// 학번 중복은 학번 칸 오류로, 나머지는 화면 위 오류로 보인다. 문구는 목업에 없어 임시로 둔다
export function studentCreateFailureOf(error: unknown): StudentCreateFailure {
  if (error instanceof ApiError && error.code === ErrorCode.STUDENT_DUPLICATE_STUDENT_NO) {
    return { field: 'studentNo', message: '이미 등록된 학번이에요' };
  }
  return { message: errorMessage(error, '학생을 등록하지 못했어요. 잠시 후 다시 시도해 주세요') };
}

// 새 초기 비밀번호로 계정정보를 다시 보낸다 — 학생이 바꿔 둔 비밀번호와 로그인은 무효가 된다
export function resendStudentCredentials(
  authRequest: AuthRequest,
  accountId: number,
): Promise<AdminStudentCredentialMail> {
  return authRequest<AdminStudentCredentialMail>(`/api/admin/students/${accountId}/credentials`, {
    method: 'POST',
  });
}
