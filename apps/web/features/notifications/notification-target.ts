import type { AppNotification } from './types';

/**
 * 알림을 누르면 갈 화면 (명세 §2.3: 장애학생은 F-02, 도우미는 F-07, 공지는 상세).
 * 도메인마다 한 역할만 받으므로(lib/site.ts) 대상 종류만으로 경로가 정해진다. 공지만 그 공지의 상세로 간다.
 */
export function notificationPath(
  notification: Pick<AppNotification, 'targetType' | 'targetId'>,
): string {
  if (notification.targetType === 'HELP_REQUEST') return '/requests';
  if (notification.targetType === 'APPLICATION') return '/matches';
  return `/notices/${notification.targetId}`;
}
