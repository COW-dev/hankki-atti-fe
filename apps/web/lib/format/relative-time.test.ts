import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from '@/lib/format/relative-time';

const NOW = new Date(2026, 9, 28, 14, 30, 0);

function minutesAgo(minutes: number) {
  return new Date(NOW.getTime() - minutes * 60_000);
}

describe('formatRelativeTime', () => {
  it('1분이 안 됐으면 방금', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 59_000), NOW)).toBe('방금');
  });

  it('서버 시각이 조금 미래여도 방금', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() + 5_000), NOW)).toBe('방금');
  });

  it('1시간이 안 됐으면 N분 전', () => {
    expect(formatRelativeTime(minutesAgo(1), NOW)).toBe('1분 전');
    expect(formatRelativeTime(minutesAgo(59), NOW)).toBe('59분 전');
  });

  it('같은 날이면 N시간 전', () => {
    expect(formatRelativeTime(minutesAgo(60), NOW)).toBe('1시간 전');
    expect(formatRelativeTime(new Date(2026, 9, 28, 0, 0), NOW)).toBe('14시간 전');
  });

  it('전날이면 시간 차이와 관계없이 어제', () => {
    expect(formatRelativeTime(new Date(2026, 9, 27, 23, 59), NOW)).toBe('어제');
    expect(formatRelativeTime(new Date(2026, 9, 27, 0, 0), NOW)).toBe('어제');
  });

  it('그 전이면 날짜', () => {
    expect(formatRelativeTime(new Date(2026, 9, 26, 23, 59), NOW)).toBe('10월 26일');
  });
});
