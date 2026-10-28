import type { AuthRequest } from '@/features/requests/api';
import type { NoticeDetail, NoticePage } from './types';

// 내 역할이 볼 수 있는 공지 한 페이지 (page는 0부터, 대상 필터는 서버가 한다)
export function fetchNotices(authRequest: AuthRequest, page: number): Promise<NoticePage> {
  return authRequest<NoticePage>(`/api/notices?page=${page}`);
}

export function fetchNotice(authRequest: AuthRequest, id: number): Promise<NoticeDetail> {
  return authRequest<NoticeDetail>(`/api/notices/${id}`);
}
