import { describe, expect, it } from 'vitest';
import { applyUpdate } from '@/features/requests/apply-update';
import type { MyHelpRequest } from '@/features/requests/types';

function request(id: number, status: MyHelpRequest['status']): MyHelpRequest {
  return {
    id,
    startAt: '2026-10-12T12:00:00',
    endAt: '2026-10-12T13:00:00',
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

describe('applyUpdate', () => {
  it('철회된 신청은 다가오는 목록에서 빠지고 지난 목록 맨 앞으로 간다', () => {
    const current = {
      upcoming: [request(1, 'RECRUITING'), request(2, 'MATCHED')],
      past: [request(3, 'COMPLETED')],
    };

    const result = applyUpdate(current, request(1, 'CANCELED'));

    expect(result.upcoming.map((r) => r.id)).toEqual([2]);
    expect(result.past.map((r) => [r.id, r.status])).toEqual([
      [1, 'CANCELED'],
      [3, 'COMPLETED'],
    ]);
  });

  it('노쇼 신고는 지난 목록의 그 자리에서 상태만 바뀐다', () => {
    const current = {
      upcoming: [],
      past: [request(5, 'FAILED'), request(3, 'COMPLETED'), request(2, 'CANCELED')],
    };

    const result = applyUpdate(current, request(3, 'NO_SHOW'));

    expect(result.past.map((r) => [r.id, r.status])).toEqual([
      [5, 'FAILED'],
      [3, 'NO_SHOW'],
      [2, 'CANCELED'],
    ]);
  });

  it('진행 중 신청이 갱신되면 다가오는 목록의 자리를 지킨다', () => {
    const current = { upcoming: [request(1, 'RECRUITING'), request(2, 'RECRUITING')], past: [] };

    const result = applyUpdate(current, { ...request(1, 'MATCHED'), helperChanged: true });

    expect(result.upcoming.map((r) => [r.id, r.status])).toEqual([
      [1, 'MATCHED'],
      [2, 'RECRUITING'],
    ]);
  });
});
