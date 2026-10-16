import { describe, expect, it } from 'vitest';
import { applyApplicationUpdate } from '@/features/matches/application-update';
import type { MyApplication } from '@/features/matches/types';

function application(
  applicationId: number,
  status: MyApplication['status'],
  extra: Partial<MyApplication> = {},
): MyApplication {
  return {
    applicationId,
    helpRequestId: applicationId * 10,
    status,
    startAt: '2026-10-17T12:00:00',
    endAt: '2026-10-17T13:00:00',
    helpTypes: ['SERVING'],
    ...extra,
  };
}

describe('applyApplicationUpdate', () => {
  it('취소한 지원은 진행 중에서 빠지고 지난 활동 맨 앞으로 간다', () => {
    const current = {
      inProgress: [application(1, 'MATCHED'), application(2, 'WAITING')],
      past: [application(3, 'COMPLETED')],
    };

    const result = applyApplicationUpdate(
      current,
      application(1, 'HELPER_CANCELED', { cancelReason: 'ILLNESS' }),
    );

    expect(result.inProgress.map((a) => a.applicationId)).toEqual([2]);
    expect(result.past.map((a) => [a.applicationId, a.status])).toEqual([
      [1, 'HELPER_CANCELED'],
      [3, 'COMPLETED'],
    ]);
  });

  it('승격을 수락하면 진행 중 자리를 지킨 채 매칭 완료로 바뀐다', () => {
    const current = {
      inProgress: [application(1, 'MATCHED'), application(2, 'PROMOTION_PENDING')],
      past: [],
    };

    const result = applyApplicationUpdate(
      current,
      application(2, 'MATCHED', { student: { name: '박서연', kakaoId: 'seoyeon_p' } }),
    );

    expect(result.inProgress.map((a) => [a.applicationId, a.status])).toEqual([
      [1, 'MATCHED'],
      [2, 'MATCHED'],
    ]);
    expect(result.inProgress[1].student?.name).toBe('박서연');
  });

  it('이미 지난 목록에 있는 건이 갱신되면 그 자리에서 바뀐다', () => {
    const current = {
      inProgress: [],
      past: [application(5, 'EXPIRED'), application(3, 'COMPLETED')],
    };

    const result = applyApplicationUpdate(current, application(3, 'NO_SHOW'));

    expect(result.past.map((a) => [a.applicationId, a.status])).toEqual([
      [5, 'EXPIRED'],
      [3, 'NO_SHOW'],
    ]);
  });
});
