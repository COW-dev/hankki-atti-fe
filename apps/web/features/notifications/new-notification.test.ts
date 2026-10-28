import { describe, expect, it } from 'vitest';
import { newNotificationAnnouncement } from '@/features/notifications/new-notification';
import type { AppNotification } from '@/features/notifications/types';

function notification(id: number, message: string, read = false): AppNotification {
  return {
    id,
    type: 'REQUEST_MATCHED',
    message,
    targetType: 'HELP_REQUEST',
    targetId: id,
    read,
    createdAt: '2026-10-28T12:00:00',
  };
}

const LATEST = [
  notification(3, '12:00 식사 도우미가 정해졌어요'),
  notification(2, '이전 알림', true),
];

describe('newNotificationAnnouncement', () => {
  it('화면에 들어와 처음 받은 개수면 읽지 않는다', () => {
    expect(newNotificationAnnouncement(null, 3, LATEST)).toBeNull();
  });

  it('개수가 같거나 줄면 읽지 않는다', () => {
    expect(newNotificationAnnouncement(2, 2, LATEST)).toBeNull();
    expect(newNotificationAnnouncement(2, 0, LATEST)).toBeNull();
  });

  it('1개 늘면 가장 최근 안 읽은 알림 문장을 읽는다', () => {
    expect(newNotificationAnnouncement(0, 1, LATEST)).toBe(
      '새 알림: 12:00 식사 도우미가 정해졌어요',
    );
  });

  it('여러 개 늘면 개수와 가장 최근 문장을 읽는다', () => {
    expect(newNotificationAnnouncement(1, 3, LATEST)).toBe(
      '새 알림 2개, 가장 최근: 12:00 식사 도우미가 정해졌어요',
    );
  });

  it('목록에 안 읽은 알림이 없으면 개수만 읽는다', () => {
    expect(newNotificationAnnouncement(0, 1, [notification(1, '읽은 알림', true)])).toBe(
      '새 알림 1개',
    );
  });
});
