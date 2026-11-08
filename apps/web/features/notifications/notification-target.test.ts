import { describe, expect, it } from 'vitest';
import { notificationPath } from '@/features/notifications/notification-target';

describe('notificationPath', () => {
  it('신청 알림이면 장애학생 내 신청으로 간다', () => {
    expect(notificationPath({ targetType: 'HELP_REQUEST', targetId: 3 }, 'STUDENT')).toBe(
      '/requests',
    );
  });

  it('지원 알림이면 도우미 매칭 현황으로 간다', () => {
    expect(notificationPath({ targetType: 'APPLICATION', targetId: 3 }, 'HELPER')).toBe(
      '/helper/matches',
    );
  });

  it('공지 알림이면 역할에 맞는 공지 상세로 간다', () => {
    expect(notificationPath({ targetType: 'NOTICE', targetId: 31 }, 'STUDENT')).toBe('/notices/31');
    expect(notificationPath({ targetType: 'NOTICE', targetId: 31 }, 'HELPER')).toBe(
      '/helper/notices/31',
    );
  });
});
