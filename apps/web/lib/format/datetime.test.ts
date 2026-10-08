import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDateTimeRange,
  formatTimeRange,
  mealOf,
  parseLocalDateTime,
  relativeMealLabel,
} from '@/lib/format/datetime';

describe('parseLocalDateTime', () => {
  it('서버 LocalDateTime을 브라우저 시간대와 상관없이 그 시각 그대로 만든다', () => {
    const date = parseLocalDateTime('2026-10-12T12:30:00');

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 12]);
    expect([date.getHours(), date.getMinutes(), date.getSeconds()]).toEqual([12, 30, 0]);
  });

  it('초가 없어도 읽고, 형식이 아니면 던진다', () => {
    expect(parseLocalDateTime('2026-10-12T09:05').getMinutes()).toBe(5);
    expect(() => parseLocalDateTime('2026-10-12')).toThrow();
  });
});

describe('format', () => {
  const noon = parseLocalDateTime('2026-10-07T12:00:00');

  // 2026-10-07은 수요일, 2026-10-02는 금요일
  it('날짜는 "10월 7일 (수)", 시간대는 "12:00 ~ 13:00"으로 쓴다', () => {
    expect(formatDate(noon)).toBe('10월 7일 (수)');
    expect(formatTimeRange(noon, parseLocalDateTime('2026-10-07T13:00:00'))).toBe('12:00 ~ 13:00');
    expect(formatDateTimeRange(noon, parseLocalDateTime('2026-10-07T13:00:00'))).toBe(
      '10월 7일 (수) 12:00 ~ 13:00',
    );
    expect(formatDateTime(parseLocalDateTime('2026-10-02T09:05:00'))).toBe('10월 2일 (금) 09:05');
  });
});

describe('relativeMealLabel', () => {
  const now = parseLocalDateTime('2026-10-06T09:00:00');

  it('오늘·내일은 상대 표현, 그 밖은 날짜로 쓴다', () => {
    expect(relativeMealLabel(parseLocalDateTime('2026-10-06T17:00:00'), now)).toBe('오늘 저녁');
    expect(relativeMealLabel(parseLocalDateTime('2026-10-07T12:00:00'), now)).toBe('내일 점심');
    expect(relativeMealLabel(parseLocalDateTime('2026-10-08T12:30:00'), now)).toBe(
      '10월 8일 (목) 점심',
    );
  });

  it('점심·저녁은 15시를 기준으로 가른다', () => {
    expect(mealOf(parseLocalDateTime('2026-10-06T13:00:00'))).toBe('LUNCH');
    expect(mealOf(parseLocalDateTime('2026-10-06T17:30:00'))).toBe('DINNER');
  });

  it('자정을 넘겨도 날짜 차이로 센다 (23:50 기준 다음 날 11:30은 내일)', () => {
    expect(
      relativeMealLabel(
        parseLocalDateTime('2026-10-07T11:30:00'),
        parseLocalDateTime('2026-10-06T23:50:00'),
      ),
    ).toBe('내일 점심');
  });
});
