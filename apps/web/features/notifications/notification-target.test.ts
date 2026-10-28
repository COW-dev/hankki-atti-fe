import { describe, expect, it } from 'vitest';
import { notificationPath } from '@/features/notifications/notification-target';

describe('notificationPath', () => {
  it('신청 알림이면 장애학생 내 신청으로 간다', () => {
    expect(notificationPath('HELP_REQUEST')).toBe('/requests');
  });

  it('지원 알림이면 도우미 매칭 현황으로 간다', () => {
    expect(notificationPath('APPLICATION')).toBe('/matches');
  });

  it('공지 알림이면 공지 상세가 생기기 전까지 이동하지 않는다', () => {
    expect(notificationPath('NOTICE')).toBeNull();
  });
});
