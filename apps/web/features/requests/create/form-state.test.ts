import { describe, expect, it } from 'vitest';
import {
  blockedStartTimes,
  canSubmit,
  EMPTY_FORM,
  initialForm,
  MORE_DATES,
  summaryText,
  timeOptionsOf,
  toRequestBody,
  visibleDateChoices,
  withDateChoice,
  withHelpTypeToggled,
} from '@/features/requests/create/form-state';
import type { MyHelpRequest, TimeOptionDate } from '@/features/requests/types';

function day(date: string, times: Array<[string, 'LUNCH' | 'DINNER']>): TimeOptionDate {
  return {
    date,
    startTimes: times.map(([time, meal]) => ({
      startAt: `${date}T${time}:00`,
      endAt: `${date}T${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}${time.slice(2)}:00`,
      meal,
    })),
  };
}

const DATES = [
  day('2026-10-09', [
    ['17:00', 'DINNER'],
    ['17:30', 'DINNER'],
  ]),
  day('2026-10-12', [
    ['11:30', 'LUNCH'],
    ['12:00', 'LUNCH'],
    ['17:00', 'DINNER'],
  ]),
  day('2026-10-13', [['12:00', 'LUNCH']]),
  day('2026-10-14', [['12:00', 'LUNCH']]),
  day('2026-10-15', [['12:00', 'LUNCH']]),
  day('2026-10-16', [['12:00', 'LUNCH']]),
];

describe('visibleDateChoices', () => {
  it('5개 이상이면 앞 3개 + 다른 날짜, 펼치면 전부', () => {
    const preview = visibleDateChoices(DATES, false);
    expect(preview.map((choice) => choice.value)).toEqual([
      '2026-10-09',
      '2026-10-12',
      '2026-10-13',
      MORE_DATES,
    ]);
    expect(visibleDateChoices(DATES, true).map((choice) => choice.value)).toEqual(
      DATES.map((item) => item.date),
    );
  });

  it('4개 이하면 다른 날짜 없이 전부 보여 준다', () => {
    const choices = visibleDateChoices(DATES.slice(0, 4), false);
    expect(choices).toHaveLength(4);
    expect(choices.some((choice) => choice.value === MORE_DATES)).toBe(false);
  });
});

describe('timeOptionsOf', () => {
  it('고른 날짜의 시각을 점심·저녁으로 나누고, 없는 쪽은 빈 배열', () => {
    const today = timeOptionsOf(DATES, '2026-10-09');
    expect(today.lunch).toEqual([]);
    expect(today.dinner.map((option) => option.startAt)).toEqual([
      '2026-10-09T17:00:00',
      '2026-10-09T17:30:00',
    ]);
    const monday = timeOptionsOf(DATES, '2026-10-12');
    expect(monday.lunch).toHaveLength(2);
    expect(monday.dinner).toHaveLength(1);
    expect(timeOptionsOf(DATES, null)).toEqual({ lunch: [], dinner: [] });
  });
});

describe('initialForm · canSubmit', () => {
  it('처음엔 첫 날짜만 골라 두고 시각은 비워 둔다', () => {
    expect(initialForm(DATES)).toMatchObject({ date: '2026-10-09', startAt: null, helpTypes: [] });
    expect(initialForm([]).date).toBeNull();
  });

  it('날짜·시각·도움이 다 있어야 보낼 수 있고, 기타면 내용까지 있어야 한다', () => {
    const base = { ...EMPTY_FORM, date: '2026-10-12', startAt: '2026-10-12T12:00:00' };
    expect(canSubmit(base)).toBe(false);
    expect(canSubmit({ ...base, helpTypes: ['SERVING'] })).toBe(true);
    expect(canSubmit({ ...base, helpTypes: ['OTHER'] })).toBe(false);
    expect(canSubmit({ ...base, helpTypes: ['OTHER'], otherHelpText: '  ' })).toBe(false);
    expect(canSubmit({ ...base, helpTypes: ['OTHER'], otherHelpText: '식판 반납' })).toBe(true);
    expect(canSubmit({ ...base, helpTypes: ['SERVING'], startAt: null })).toBe(false);
  });

  it('메모가 200자를 넘으면 보낼 수 없다', () => {
    const base = {
      ...EMPTY_FORM,
      date: '2026-10-12',
      startAt: '2026-10-12T12:00:00',
      helpTypes: ['SERVING' as const],
    };
    expect(canSubmit({ ...base, memo: '가'.repeat(200) })).toBe(true);
    expect(canSubmit({ ...base, memo: '가'.repeat(201) })).toBe(false);
  });
});

describe('toRequestBody', () => {
  it('빈 메모·기타 내용은 빼고, 기타를 안 골랐으면 내용도 버린다', () => {
    const body = toRequestBody({
      ...EMPTY_FORM,
      date: '2026-10-12',
      startAt: '2026-10-12T12:00:00',
      helpTypes: ['SERVING', 'SEATING'],
      otherHelpText: '무시될 내용',
      memo: '  ',
    });
    expect(body).toEqual({ startAt: '2026-10-12T12:00:00', helpTypes: ['SERVING', 'SEATING'] });
  });

  it('기타 내용과 메모는 앞뒤 공백을 지워 보낸다', () => {
    const body = toRequestBody({
      ...EMPTY_FORM,
      date: '2026-10-12',
      startAt: '2026-10-12T12:00:00',
      helpTypes: ['OTHER'],
      otherHelpText: ' 식판 반납 ',
      memo: ' 출입구에서 기다릴게요 ',
    });
    expect(body).toEqual({
      startAt: '2026-10-12T12:00:00',
      helpTypes: ['OTHER'],
      otherHelpText: '식판 반납',
      memo: '출입구에서 기다릴게요',
    });
  });
});

describe('summaryText', () => {
  it('"10월 12일 12:00 ~ 13:00 · 1시간"', () => {
    expect(summaryText(DATES[1].startTimes[1])).toBe('10월 12일 12:00 ~ 13:00 · 1시간');
    expect(summaryText(null)).toBeNull();
  });
});

describe('withDateChoice · withHelpTypeToggled', () => {
  it('다른 날짜는 펼치기만 하고, 날짜를 바꾸면 시각 선택을 지운다', () => {
    const chosen = { ...EMPTY_FORM, date: '2026-10-09', startAt: '2026-10-09T17:00:00' };
    expect(withDateChoice(chosen, MORE_DATES)).toMatchObject({
      date: '2026-10-09',
      startAt: '2026-10-09T17:00:00',
      datesExpanded: true,
    });
    expect(withDateChoice(chosen, '2026-10-12')).toMatchObject({
      date: '2026-10-12',
      startAt: null,
    });
    expect(withDateChoice(chosen, '2026-10-09')).toBe(chosen);
  });

  it('도움 유형은 누를 때마다 넣고 뺀다', () => {
    const once = withHelpTypeToggled(EMPTY_FORM, 'SERVING');
    expect(once.helpTypes).toEqual(['SERVING']);
    expect(withHelpTypeToggled(once, 'OTHER').helpTypes).toEqual(['SERVING', 'OTHER']);
    expect(withHelpTypeToggled(once, 'SERVING').helpTypes).toEqual([]);
  });
});

describe('blockedStartTimes', () => {
  function upcoming(startAt: string, status: MyHelpRequest['status']): MyHelpRequest {
    const date = startAt.slice(0, 10);
    const hour = Number(startAt.slice(11, 13));
    return {
      id: 1,
      startAt,
      endAt: `${date}T${String(hour + 1).padStart(2, '0')}${startAt.slice(13)}`,
      status,
      helpTypes: ['SERVING'],
      otherHelpText: null,
      memo: null,
      helper: null,
      helperChanged: false,
      noShowReportable: false,
      noShowDeadline: null,
    };
  }
  const monday = [
    day('2026-10-12', [
      ['11:30', 'LUNCH'],
      ['12:00', 'LUNCH'],
      ['12:30', 'LUNCH'],
      ['13:00', 'LUNCH'],
      ['17:00', 'DINNER'],
    ]),
  ];

  it('12:00 신청이 있으면 30분 옆 11:30·12:30은 겹치고, 1시간 옆 13:00은 겹치지 않는다', () => {
    const blocked = blockedStartTimes(monday, [upcoming('2026-10-12T12:00:00', 'MATCHED')]);
    expect([...blocked]).toEqual([
      '2026-10-12T11:30:00',
      '2026-10-12T12:00:00',
      '2026-10-12T12:30:00',
    ]);
  });

  it('끝난 신청(취소·실패)은 막지 않는다', () => {
    expect(blockedStartTimes(monday, [upcoming('2026-10-12T12:00:00', 'CANCELED')]).size).toBe(0);
    expect(blockedStartTimes(monday, []).size).toBe(0);
  });
});
