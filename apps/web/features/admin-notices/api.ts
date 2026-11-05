import type { AuthRequest } from '@/features/requests/api';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import type { NoticeTarget } from '@/lib/labels/notice';
import type { AdminNoticeDetail, AdminNoticePage } from './types';

// 저장 요청 본문 (백엔드 AdminNoticeSaveRequestDto). 앞뒤 공백 정리는 서버가 한다
export type NoticeSaveRequest = {
  title: string;
  body: string;
  target: NoticeTarget;
  pinned: boolean;
};

export function fetchAdminNotices(
  authRequest: AuthRequest,
  page: number,
): Promise<AdminNoticePage> {
  return authRequest<AdminNoticePage>(`/api/admin/notices?page=${page}`);
}

export function fetchAdminNotice(
  authRequest: AuthRequest,
  noticeId: number,
): Promise<AdminNoticeDetail> {
  return authRequest<AdminNoticeDetail>(`/api/admin/notices/${noticeId}`);
}

// 저장하면 바로 게시되고 대상에게 알림이 간다
export function createNotice(
  authRequest: AuthRequest,
  request: NoticeSaveRequest,
): Promise<AdminNoticeDetail> {
  return authRequest<AdminNoticeDetail>('/api/admin/notices', { method: 'POST', body: request });
}

// 수정은 대상을 바꿔도 알림을 다시 보내지 않는다
export function updateNotice(
  authRequest: AuthRequest,
  noticeId: number,
  request: NoticeSaveRequest,
): Promise<AdminNoticeDetail> {
  return authRequest<AdminNoticeDetail>(`/api/admin/notices/${noticeId}`, {
    method: 'PATCH',
    body: request,
  });
}

export function deleteNotice(authRequest: AuthRequest, noticeId: number): Promise<unknown> {
  return authRequest(`/api/admin/notices/${noticeId}`, { method: 'DELETE' });
}

export function isNoticeGone(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === ErrorCode.NOTICE_DELETED || error.code === ErrorCode.NOTICE_NOT_FOUND)
  );
}

function isAccessDenied(error: unknown): boolean {
  return error instanceof ApiError && error.code === ErrorCode.ACCESS_DENIED;
}

// 문구는 목업에 없어 임시로 둔다. 권한 오류는 화면을 연 뒤 권한이 바뀌었을 때 난다
export function noticeLoadFailureMessage(error: unknown): string {
  if (isNoticeGone(error)) return '삭제된 공지예요';
  return errorMessage(error, '공지를 불러오지 못했어요. 잠시 후 다시 시도해 주세요');
}

export function noticeSaveFailureMessage(error: unknown): string {
  if (isNoticeGone(error)) return '삭제된 공지예요';
  if (isAccessDenied(error)) return '전체 권한 관리자만 공지를 저장할 수 있어요';
  if (error instanceof ApiError && error.code === ErrorCode.NOTICE_DUPLICATE_SUBMIT) {
    return '방금 같은 제목으로 게시했어요. 잠시 후 다시 시도해 주세요';
  }
  return errorMessage(error, '공지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요');
}

export function noticeDeleteFailureMessage(error: unknown): string {
  if (isAccessDenied(error)) return '전체 권한 관리자만 공지를 삭제할 수 있어요';
  return errorMessage(error, '공지를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요');
}
