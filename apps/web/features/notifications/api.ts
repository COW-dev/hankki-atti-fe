import type { AuthRequest } from '@/features/requests/api';
import type { AppNotification, NotificationPage } from './types';

// 알림 목록 (최신순 20개씩). 다음 페이지는 이전 응답의 nextCursor를 넘긴다
export function fetchNotifications(
  authRequest: AuthRequest,
  cursor?: number,
): Promise<NotificationPage> {
  const query = cursor === undefined ? '' : `?cursor=${cursor}`;
  return authRequest<NotificationPage>(`/api/notifications${query}`);
}

export function fetchUnreadCount(authRequest: AuthRequest): Promise<{ count: number }> {
  return authRequest<{ count: number }>('/api/notifications/unread-count');
}

// 한 건 읽음. 응답은 읽음이 된 알림
export function markNotificationRead(
  authRequest: AuthRequest,
  id: number,
): Promise<AppNotification> {
  return authRequest<AppNotification>(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

// 모두 읽음. 응답은 이번에 읽음으로 바뀐 개수
export function markAllNotificationsRead(authRequest: AuthRequest): Promise<{ readCount: number }> {
  return authRequest<{ readCount: number }>('/api/notifications/read-all', { method: 'PATCH' });
}
