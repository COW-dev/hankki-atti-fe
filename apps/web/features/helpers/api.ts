import type { AuthRequest } from '@/features/requests/api';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import type {
  AdminHelperAccountStatus,
  AdminHelperActivity,
  AdminHelperDeactivation,
  AdminHelperDeactivationPreview,
  AdminHelperDetail,
  AdminHelperPage,
  AdminHelperTemporaryPassword,
  AdminVolunteerHours,
  HelperFilter,
} from './types';

// 도우미 목록 한 페이지 (page는 0부터, 20명씩, 가입 최근순). 빈 조건은 보내지 않는다
export function fetchHelpers(
  authRequest: AuthRequest,
  filter: HelperFilter,
): Promise<AdminHelperPage> {
  const params = new URLSearchParams({ page: String(filter.page) });
  const q = filter.q.trim();
  if (q) params.set('q', q);
  if (filter.status) params.set('status', filter.status);
  if (filter.attiMember) params.set('attiMember', filter.attiMember);
  return authRequest<AdminHelperPage>(`/api/admin/helpers?${params}`);
}

export function fetchHelper(
  authRequest: AuthRequest,
  helperId: number,
): Promise<AdminHelperDetail> {
  return authRequest<AdminHelperDetail>(`/api/admin/helpers/${helperId}`);
}

export function fetchHelperActivities(
  authRequest: AuthRequest,
  helperId: number,
): Promise<AdminHelperActivity[]> {
  return authRequest<AdminHelperActivity[]>(`/api/admin/helpers/${helperId}/activities`);
}

// 도우미의 기존 비밀번호와 로그인이 바로 무효가 되고, 다음 로그인 때 비밀번호를 바꿔야 한다
export function issueHelperTemporaryPassword(
  authRequest: AuthRequest,
  helperId: number,
): Promise<AdminHelperTemporaryPassword> {
  return authRequest<AdminHelperTemporaryPassword>(
    `/api/admin/helpers/${helperId}/temporary-password`,
    { method: 'POST' },
  );
}

export function previewHelperDeactivation(
  authRequest: AuthRequest,
  helperId: number,
): Promise<AdminHelperDeactivationPreview> {
  return authRequest<AdminHelperDeactivationPreview>(
    `/api/admin/helpers/${helperId}/deactivation-preview`,
  );
}

export function deactivateHelper(
  authRequest: AuthRequest,
  helperId: number,
): Promise<AdminHelperDeactivation> {
  return authRequest<AdminHelperDeactivation>(`/api/admin/helpers/${helperId}/deactivate`, {
    method: 'POST',
  });
}

export function activateHelper(
  authRequest: AuthRequest,
  helperId: number,
): Promise<AdminHelperAccountStatus> {
  return authRequest<AdminHelperAccountStatus>(`/api/admin/helpers/${helperId}/activate`, {
    method: 'POST',
  });
}

export function updateVolunteerHours(
  authRequest: AuthRequest,
  applicationId: number,
  hours: number,
  reason: string,
): Promise<AdminVolunteerHours> {
  return authRequest<AdminVolunteerHours>(
    `/api/admin/applications/${applicationId}/volunteer-hours`,
    { method: 'PATCH', body: { hours, reason: reason.trim() } },
  );
}

// 문구는 목업에 없어 임시로 둔다. 값이 같다는 오류는 다른 관리자가 먼저 고쳤을 때 난다
export function volunteerHoursFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === ErrorCode.APPLICATION_VOLUNTEER_HOURS_UNCHANGED) {
      return '지금 봉사시간과 같아요';
    }
    if (error.code === ErrorCode.ACCESS_DENIED) return '봉사시간 수정은 전체 권한만 할 수 있어요';
  }
  return errorMessage(error, '봉사시간을 수정하지 못했어요. 잠시 후 다시 시도해 주세요');
}
