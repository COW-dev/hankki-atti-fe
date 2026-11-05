import { describe, expect, it } from 'vitest';
import {
  activityAfter,
  activityHours,
  activityReason,
  activityTag,
  activityTiming,
  deactivationImpact,
  deactivationTargetText,
} from '@/features/helpers/activity';
import type {
  AdminHelperActivity,
  AdminHelperDeactivationPreview,
  AdminHelperDeactivationTarget,
} from '@/features/helpers/types';

const activity = (patch: Partial<AdminHelperActivity>): AdminHelperActivity => ({
  applicationId: 1,
  helpRequestId: 2,
  startAt: '2026-09-24T12:30:00',
  studentId: 3,
  studentName: '김민지',
  status: 'MATCHED',
  cancelReason: null,
  cancelReasonDetail: null,
  canceledAt: null,
  minutesBeforeMeal: null,
  minutesAfterCompletion: null,
  afterAction: null,
  promotedWaitingOrder: null,
  requestStatus: 'MATCHED',
  volunteerHours: null,
  volunteerHourChanges: [],
  ...patch,
});

describe('activityTag', () => {
  it('취소·노쇼는 누가 했는지 드러나는 문구로 보인다', () => {
    expect(activityTag('HELPER_CANCELED')).toEqual({ label: '도우미 취소', tone: 'warning' });
    expect(activityTag('NO_SHOW')).toEqual({ label: '노쇼 신고', tone: 'error' });
  });

  it('그 밖의 상태는 지원 상태 문구를 쓴다', () => {
    expect(activityTag('COMPLETED')).toEqual({ label: '이용 완료', tone: 'ended' });
  });
});

describe('activityReason', () => {
  it('도우미 취소는 인정 사유로, 기타는 입력 내용과 함께 보인다', () => {
    expect(activityReason(activity({ status: 'HELPER_CANCELED', cancelReason: 'ACADEMIC' }))).toBe(
      '인정 사유 · 학사 일정 변경',
    );
    expect(
      activityReason(
        activity({
          status: 'HELPER_CANCELED',
          cancelReason: 'OTHER',
          cancelReasonDetail: '수업 보강',
        }),
      ),
    ).toBe('기타 · "수업 보강"');
  });

  it('노쇼는 이용 후 신고까지 걸린 시간을 보인다', () => {
    expect(activityReason(activity({ status: 'NO_SHOW', minutesAfterCompletion: 180 }))).toBe(
      '학생 신고 (이용 후 3시간)',
    );
  });

  it('사유가 없는 상태는 null이다', () => {
    expect(activityReason(activity({ status: 'COMPLETED' }))).toBeNull();
  });
});

describe('activityTiming', () => {
  it('식사 몇 시간 전 취소했는지 보인다', () => {
    expect(activityTiming(activity({ minutesBeforeMeal: 1560 }))).toBe('식사 26시간 전');
    expect(activityTiming(activity({}))).toBeNull();
  });
});

describe('activityAfter', () => {
  it('예비 승격은 승격된 순번을 보인다', () => {
    expect(activityAfter(activity({ afterAction: 'PROMOTED', promotedWaitingOrder: 1 }))).toBe(
      '예비 1번 승격',
    );
  });

  it('모집 재개는 그 신청의 지금 결과를 보인다', () => {
    expect(activityAfter(activity({ afterAction: 'REOPENED', requestStatus: 'MATCHED' }))).toBe(
      '모집 재개 → 매칭',
    );
    expect(activityAfter(activity({ afterAction: 'REOPENED', requestStatus: 'FAILED' }))).toBe(
      '모집 재개 → 매칭 실패',
    );
  });

  it('노쇼는 봉사시간에서 빠진다', () => {
    expect(activityAfter(activity({ status: 'NO_SHOW' }))).toBe('봉사시간 제외');
  });
});

describe('activityHours', () => {
  it('서버 값이 있으면 그 값을 보인다', () => {
    expect(activityHours(activity({ status: 'COMPLETED', volunteerHours: 1.5 }))).toBe('1.5시간');
    expect(activityHours(activity({ status: 'NO_SHOW', volunteerHours: 0 }))).toBe('0시간');
  });

  it('값이 없으면 도우미 취소만 0시간이고 진행 중 매칭은 비워 둔다', () => {
    expect(activityHours(activity({ status: 'HELPER_CANCELED' }))).toBe('0시간');
    expect(activityHours(activity({ status: 'MATCHED' }))).toBeNull();
  });
});

describe('비활성화 안내', () => {
  const target = (
    patch: Partial<AdminHelperDeactivationTarget>,
  ): AdminHelperDeactivationTarget => ({
    applicationId: 1,
    helpRequestId: 2,
    startAt: '2026-09-30T12:00:00',
    studentName: '이서준',
    status: 'MATCHED',
    waitingOrder: null,
    ...patch,
  });

  it('풀릴 건수를 알리고 없으면 없다고 알린다', () => {
    const preview: AdminHelperDeactivationPreview = {
      helperId: 1,
      alreadyInactive: false,
      matchedCount: 1,
      waitingCount: 1,
      targets: [target({})],
    };

    expect(deactivationImpact(preview)).toBe('진행 중 매칭 1건, 예비 1건이 풀려요');
    expect(deactivationImpact({ ...preview, matchedCount: 0, waitingCount: 0, targets: [] })).toBe(
      '풀릴 매칭·예비는 없어요',
    );
  });

  it('매칭과 승격 응답 대기는 다음 예비로 넘어간다고 알린다', () => {
    expect(deactivationTargetText(target({}))).toBe(
      '09.30(수) 12:00 이서준 — 예비 1번이 자동 승격돼요. 예비가 없으면 모집을 다시 열고 학생에게 알려요',
    );
    expect(deactivationTargetText(target({ status: 'PROMOTION_PENDING' }))).toContain(
      '자동 승격돼요',
    );
  });

  it('예비는 순번과 함께 자리에서 빠진다고 알린다', () => {
    expect(
      deactivationTargetText(
        target({ startAt: '2026-10-01T12:30:00', status: 'WAITING', waitingOrder: 2 }),
      ),
    ).toBe('10.01(목) 12:30 예비 2번 — 자리에서 빠지고 뒤 순번이 당겨져요');
  });
});
