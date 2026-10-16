import { describe, expect, it } from 'vitest';
import { formatVolunteerHours, pastActivityNote } from '@/features/matches/past-note';
import type { MyApplication } from '@/features/matches/types';

function application(status: MyApplication['status'], extra: Partial<MyApplication> = {}) {
  return {
    applicationId: 1,
    helpRequestId: 10,
    status,
    startAt: '2026-10-07T12:00:00',
    endAt: '2026-10-07T13:00:00',
    helpTypes: ['SERVING'],
    ...extra,
  } satisfies MyApplication;
}

describe('pastActivityNote', () => {
  it('이용 완료는 봉사시간, 노쇼·예비 종료·빠짐은 부가 문구가 없다', () => {
    expect(pastActivityNote(application('COMPLETED', { volunteerHours: 1 }))).toBe(
      '봉사시간 1시간',
    );
    expect(pastActivityNote(application('COMPLETED'))).toBeNull();
    expect(pastActivityNote(application('NO_SHOW', { volunteerHours: 0 }))).toBeNull();
    expect(pastActivityNote(application('EXPIRED'))).toBeNull();
    expect(pastActivityNote(application('WITHDRAWN'))).toBeNull();
  });

  it('취소·제외·거절은 이유와 패널티 여부를 알려 준다', () => {
    expect(pastActivityNote(application('STUDENT_CANCELED'))).toBe('장애학생 사정 · 패널티 없어요');
    expect(pastActivityNote(application('HELPER_CANCELED', { cancelReason: 'ACADEMIC' }))).toBe(
      '학사 일정 변경 (시험·보강)',
    );
    expect(pastActivityNote(application('HELPER_CANCELED', { cancelReason: 'OTHER' }))).toBe(
      '기타 사유',
    );
    expect(pastActivityNote(application('EXCLUDED'))).toBe('같은 시간 다른 건에 매칭됨');
    expect(pastActivityNote(application('PROMOTION_DECLINED'))).toBe('패널티 없어요');
  });

  it('봉사시간은 정수면 그대로, 0.5 단위면 소수 한 자리로 쓴다', () => {
    expect(formatVolunteerHours(1)).toBe('1시간');
    expect(formatVolunteerHours(0)).toBe('0시간');
    expect(formatVolunteerHours(1.5)).toBe('1.5시간');
  });
});
