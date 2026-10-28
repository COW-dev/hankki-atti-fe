import type { NotificationTargetType } from './types';

/**
 * 알림을 누르면 갈 화면 (명세 §2.3: 장애학생은 F-02, 도우미는 F-07, 공지는 상세).
 * 도메인마다 한 역할만 받으므로(lib/site.ts) 대상 종류만으로 경로가 정해진다.
 * 공지 상세(U-25)는 아직 없어 이동하지 않는다.
 */
export function notificationPath(targetType: NotificationTargetType): string | null {
  if (targetType === 'HELP_REQUEST') return '/requests';
  if (targetType === 'APPLICATION') return '/matches';
  return null;
}
