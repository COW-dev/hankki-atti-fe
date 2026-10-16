import { describe, expect, it } from 'vitest';
import {
  APPLICATION_FILTER_OPTIONS,
  countApplications,
  filterApplications,
} from '@/features/matches/application-filter';
import type { MyApplication, MyApplications } from '@/features/matches/types';

function application(applicationId: number, status: MyApplication['status']): MyApplication {
  return {
    applicationId,
    helpRequestId: applicationId * 10,
    status,
    startAt: '2026-10-17T12:00:00',
    endAt: '2026-10-17T13:00:00',
    helpTypes: ['SERVING'],
  };
}

const DATA: MyApplications = {
  inProgress: [
    application(1, 'MATCHED'),
    application(2, 'PROMOTION_PENDING'),
    application(3, 'WAITING'),
  ],
  past: [application(4, 'COMPLETED'), application(5, 'EXCLUDED')],
};

describe('filterApplications', () => {
  it('필터 칩은 전체 · 매칭 · 예비 · 지난 활동 순서다', () => {
    expect(APPLICATION_FILTER_OPTIONS.map((option) => option.label)).toEqual([
      '전체',
      '매칭',
      '예비',
      '지난 활동',
    ]);
  });

  it('전체는 그대로, 매칭은 매칭 완료만 남기고 지난 목록을 비운다', () => {
    expect(filterApplications(DATA, 'ALL')).toBe(DATA);

    const matched = filterApplications(DATA, 'MATCHED');

    expect(matched.inProgress.map((a) => a.applicationId)).toEqual([1]);
    expect(matched.past).toEqual([]);
  });

  it('예비는 예비와 승격 응답 대기를 함께 남긴다 (API WAITING 필터와 같음)', () => {
    const waiting = filterApplications(DATA, 'WAITING');

    expect(waiting.inProgress.map((a) => a.status)).toEqual(['PROMOTION_PENDING', 'WAITING']);
    expect(waiting.past).toEqual([]);
  });

  it('지난 활동은 진행 중을 비우고 지난 목록만 남기며 개수는 둘을 합친다', () => {
    const past = filterApplications(DATA, 'PAST');

    expect(past.inProgress).toEqual([]);
    expect(past.past.map((a) => a.applicationId)).toEqual([4, 5]);
    expect(countApplications(DATA)).toBe(5);
    expect(countApplications(past)).toBe(2);
  });
});
