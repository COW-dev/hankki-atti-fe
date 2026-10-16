import { describe, expect, it } from 'vitest';
import {
  countRequests,
  dateFilterOptions,
  filterDates,
  openRange,
} from '@/features/requests/open/date-filter';
import type { OpenHelpRequest, OpenHelpRequestDate } from '@/features/requests/types';
import { parseLocalDateTime } from '@/lib/format/datetime';

const NOW = parseLocalDateTime('2026-10-16T09:00:00');

function request(id: number): OpenHelpRequest {
  return {
    id,
    startAt: '2026-10-16T12:00:00',
    endAt: '2026-10-16T13:00:00',
    helpTypes: ['SERVING'],
    applyOutcome: 'MATCH',
    blockReason: null,
  };
}

const DATES: OpenHelpRequestDate[] = [
  { date: '2026-10-16', requests: [request(1), request(2)] },
  { date: '2026-10-17', requests: [] },
  { date: '2026-10-18', requests: [request(3)] },
  { date: '2026-10-20', requests: [request(4)] },
];

describe('date-filter', () => {
  it('조회 범위는 오늘부터 7일 뒤까지다', () => {
    expect(openRange(NOW)).toEqual({ from: '2026-10-16', to: '2026-10-23' });
  });

  it('칩은 오늘 · 내일 · 모레 · 이번 주 네 개다', () => {
    expect(dateFilterOptions(NOW)).toEqual([
      { value: 'today', label: '오늘' },
      { value: 'tomorrow', label: '내일 10/17' },
      { value: 'dayAfter', label: '10/18' },
      { value: 'week', label: '이번 주' },
    ]);
  });

  it('날짜 필터는 그날 그룹만 남기고 신청이 없는 날짜는 비운다', () => {
    expect(filterDates(DATES, 'today', NOW).map((group) => group.date)).toEqual(['2026-10-16']);
    expect(filterDates(DATES, 'tomorrow', NOW)).toEqual([]);
    expect(filterDates(DATES, 'dayAfter', NOW).map((group) => group.date)).toEqual(['2026-10-18']);
  });

  it('이번 주는 신청이 있는 날짜를 전부 순서대로 남긴다', () => {
    expect(filterDates(DATES, 'week', NOW).map((group) => group.date)).toEqual([
      '2026-10-16',
      '2026-10-18',
      '2026-10-20',
    ]);
    expect(countRequests(filterDates(DATES, 'week', NOW))).toBe(4);
  });
});
