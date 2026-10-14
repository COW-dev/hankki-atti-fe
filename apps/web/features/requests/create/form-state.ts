import {
  formatDateShort,
  formatTimeRange,
  parseLocalDate,
  parseLocalDateTime,
} from '@/lib/format/datetime';
import type { HelpType } from '@/lib/labels/help-request';
import type { CreateHelpRequestBody, MyHelpRequest, TimeOption, TimeOptionDate } from '../types';

// 날짜 칩은 앞 3개 + "다른 날짜"로 시작하고, 누르면 나머지가 펼쳐진다 (2026-10-08 결정, 달력 없음)
export const PREVIEW_DATE_COUNT = 3;
export const MORE_DATES = 'MORE' as const;

export type CreateFormState = {
  date: string | null;
  startAt: string | null;
  helpTypes: HelpType[];
  otherHelpText: string;
  memo: string;
  datesExpanded: boolean;
};

export const EMPTY_FORM: CreateFormState = {
  date: null,
  startAt: null,
  helpTypes: [],
  otherHelpText: '',
  memo: '',
  datesExpanded: false,
};

// 처음엔 첫 날짜(보통 오늘)를 골라 둔다. 시각은 비워 둔다 (2026-10-09 결정)
export function initialForm(dates: TimeOptionDate[]): CreateFormState {
  return { ...EMPTY_FORM, date: dates[0]?.date ?? null };
}

export type DateChoice = { value: string; date: Date } | { value: typeof MORE_DATES };

/**
 * 날짜 칩 목록. 4개 이하면 전부, 아니면 앞 3개 + "다른 날짜". 펼쳤으면 전부.
 */
export function visibleDateChoices(dates: TimeOptionDate[], expanded: boolean): DateChoice[] {
  const all = dates.map((item) => ({ value: item.date, date: parseLocalDate(item.date) }));
  if (expanded || all.length <= PREVIEW_DATE_COUNT + 1) return all;
  return [...all.slice(0, PREVIEW_DATE_COUNT), { value: MORE_DATES }];
}

// 고른 날짜의 시각을 점심·저녁으로 나눈다. 없는 쪽은 빈 배열
export function timeOptionsOf(
  dates: TimeOptionDate[],
  date: string | null,
): { lunch: TimeOption[]; dinner: TimeOption[] } {
  const startTimes = dates.find((item) => item.date === date)?.startTimes ?? [];
  return {
    lunch: startTimes.filter((option) => option.meal === 'LUNCH'),
    dinner: startTimes.filter((option) => option.meal === 'DINNER'),
  };
}

// 날짜 칩 선택: "다른 날짜"는 펼치기만, 날짜를 바꾸면 시각 선택은 지운다
export function withDateChoice(state: CreateFormState, value: string): CreateFormState {
  if (value === MORE_DATES) return { ...state, datesExpanded: true };
  if (value === state.date) return state;
  return { ...state, date: value, startAt: null };
}

export function withHelpTypeToggled(state: CreateFormState, type: HelpType): CreateFormState {
  const helpTypes = state.helpTypes.includes(type)
    ? state.helpTypes.filter((item) => item !== type)
    : [...state.helpTypes, type];
  return { ...state, helpTypes };
}

/**
 * 내 진행 중 신청(모집 중·매칭 완료)과 이용 시간이 겹치는 시작 시각. 서버가 409로 막는 것을 화면에서 미리 비활성으로 보여 준다.
 * 구간 겹침이라 30분 옆 시각은 겹치고 1시간 옆 시각(끝 = 시작)은 겹치지 않는다.
 */
export function blockedStartTimes(dates: TimeOptionDate[], upcoming: MyHelpRequest[]): Set<string> {
  const ranges = upcoming
    .filter((request) => request.status === 'RECRUITING' || request.status === 'MATCHED')
    .map((request) => ({
      start: parseLocalDateTime(request.startAt).getTime(),
      end: parseLocalDateTime(request.endAt).getTime(),
    }));
  const blocked = new Set<string>();
  for (const option of dates.flatMap((item) => item.startTimes)) {
    const start = parseLocalDateTime(option.startAt).getTime();
    const end = parseLocalDateTime(option.endAt).getTime();
    if (ranges.some((range) => start < range.end && range.start < end)) blocked.add(option.startAt);
  }
  return blocked;
}

export function needsOtherHelpText(state: CreateFormState): boolean {
  return state.helpTypes.includes('OTHER');
}

// 날짜·시각·도움 1개 이상, 기타를 골랐으면 내용까지 있어야 보낼 수 있다 (백엔드 검증과 같음)
export function canSubmit(state: CreateFormState): boolean {
  return (
    state.date !== null &&
    state.startAt !== null &&
    state.helpTypes.length > 0 &&
    (!needsOtherHelpText(state) || state.otherHelpText.trim().length > 0) &&
    state.memo.length <= MEMO_MAX_LENGTH &&
    state.otherHelpText.length <= OTHER_HELP_TEXT_MAX_LENGTH
  );
}

export const MEMO_MAX_LENGTH = 200;
export const OTHER_HELP_TEXT_MAX_LENGTH = 100;

// 빈 메모·기타 내용은 보내지 않는다. 기타를 안 골랐으면 내용도 버린다
export function toRequestBody(state: CreateFormState): CreateHelpRequestBody {
  if (state.startAt === null) throw new Error('시작 시각을 고르지 않았어요');
  const otherHelpText = needsOtherHelpText(state) ? state.otherHelpText.trim() : '';
  const memo = state.memo.trim();
  return {
    startAt: state.startAt,
    helpTypes: state.helpTypes,
    ...(otherHelpText ? { otherHelpText } : {}),
    ...(memo ? { memo } : {}),
  };
}

// 선택 요약 "10월 9일 12:00 ~ 13:00 · 1시간" (Figma 206:1542). 시각을 안 골랐으면 null
export function summaryText(option: TimeOption | null): string | null {
  if (!option) return null;
  const start = parseLocalDateTime(option.startAt);
  const end = parseLocalDateTime(option.endAt);
  return `${formatDateShort(start)} ${formatTimeRange(start, end)} · 1시간`;
}
