import { describe, expect, it } from 'vitest';
import { notificationPath } from '@/features/notifications/notification-target';

describe('notificationPath', () => {
  it('신청 알림이면 장애학생 내 신청으로 간다', () => {
    expect(notificationPath({ targetType: 'HELP_REQUEST', targetId: 3 })).toBe('/requests');
  });

  it('지원 알림이면 도우미 매칭 현황으로 간다', () => {
    expect(notificationPath({ targetType: 'APPLICATION', targetId: 3 })).toBe('/matches');
  });

  it('공지 알림이면 그 공지의 상세로 간다', () => {
    expect(notificationPath({ targetType: 'NOTICE', targetId: 31 })).toBe('/notices/31');
  });
});
