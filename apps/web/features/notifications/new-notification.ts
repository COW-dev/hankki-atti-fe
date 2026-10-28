import type { AppNotification } from './types';

/**
 * 주기 조회에서 안 읽은 개수가 늘었을 때 polite 영역에서 읽어 줄 문장 (명세 §2.3 "새 알림은 전역 aria-live 영역 1개").
 * 화면에 들어와 처음 받은 개수(previous가 null)는 새 알림이 아니므로 읽지 않는다. 줄거나 같아도 읽지 않는다.
 */
export function newNotificationAnnouncement(
  previous: number | null,
  current: number,
  latest: AppNotification[],
): string | null {
  if (previous === null || current <= previous) return null;
  const added = current - previous;
  const newest = latest.find((item) => !item.read);
  if (!newest) return `새 알림 ${added}개`;
  return added === 1
    ? `새 알림: ${newest.message}`
    : `새 알림 ${added}개, 가장 최근: ${newest.message}`;
}
