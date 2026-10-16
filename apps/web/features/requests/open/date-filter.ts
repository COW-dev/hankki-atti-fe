import { addDays, formatIsoDate, openDateChipLabel } from '@/lib/format/datetime';
import type { ChipOption } from '@hankki/ui';
import type { OpenHelpRequestDate } from '../types';

// F-06 날짜 필터 (Figma 208:3532): 오늘 · 내일 · 모레 · 이번 주. "이번 주"는 오늘부터 7일 뒤까지 전부 (장애학생 신청 가능 기간과 같음)
export type DateFilter = 'today' | 'tomorrow' | 'dayAfter' | 'week';
export const DEFAULT_DATE_FILTER: DateFilter = 'today';
export const OPEN_RANGE_DAYS = 7;

const DAY_OFFSET: Record<Exclude<DateFilter, 'week'>, number> = {
  today: 0,
  tomorrow: 1,
  dayAfter: 2,
};

// 목록은 한 번만 받고(from=오늘, to=오늘+7) 화면에서 거른다
export function openRange(now: Date): { from: string; to: string } {
  return { from: formatIsoDate(now), to: formatIsoDate(addDays(now, OPEN_RANGE_DAYS)) };
}

export function dateFilterOptions(now: Date): ChipOption<DateFilter>[] {
  return [
    { value: 'today', label: openDateChipLabel(now, now) },
    { value: 'tomorrow', label: openDateChipLabel(addDays(now, 1), now) },
    { value: 'dayAfter', label: openDateChipLabel(addDays(now, 2), now) },
    { value: 'week', label: '이번 주' },
  ];
}

/**
 * 고른 필터의 날짜 그룹만 남긴다. 신청이 없는 날짜 그룹은 그리지 않는다.
 * 서버가 날짜 순으로 주므로 순서는 그대로 둔다.
 */
export function filterDates(
  dates: OpenHelpRequestDate[],
  filter: DateFilter,
  now: Date,
): OpenHelpRequestDate[] {
  const withRequests = dates.filter((group) => group.requests.length > 0);
  if (filter === 'week') return withRequests;
  const target = formatIsoDate(addDays(now, DAY_OFFSET[filter]));
  return withRequests.filter((group) => group.date === target);
}

export function countRequests(dates: OpenHelpRequestDate[]): number {
  return dates.reduce((sum, group) => sum + group.requests.length, 0);
}
