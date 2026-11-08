import { rolePath } from '@/lib/site';
import type { AppNotification } from './types';

/**
 * 알림을 누르면 갈 화면 (명세 §2.3: 장애학생은 F-02, 도우미는 F-07, 공지는 상세).
 * 공지만 그 공지의 상세로 간다.
 */
export function notificationPath(
  notification: Pick<AppNotification, 'targetType' | 'targetId'>,
  role: 'STUDENT' | 'HELPER',
): string {
  if (notification.targetType === 'HELP_REQUEST') return rolePath(role, '/requests');
  if (notification.targetType === 'APPLICATION') return '/helper/matches';
  return rolePath(role, `/notices/${notification.targetId}`);
}
