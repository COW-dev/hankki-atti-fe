import { describe, expect, it } from 'vitest';
import {
  durationText,
  historyAfter,
  historyReason,
  historyTiming,
  promotionText,
} from '@/features/students/history';
import type { AdminStudentHelpRequest, AdminStudentHistory } from '@/features/students/types';

const history = (overrides: Partial<AdminStudentHistory>): AdminStudentHistory => ({
  type: 'HELPER_CANCELED',
  helpRequestId: 1,
  startAt: '2026-09-24T12:30:00',
  helper: { id: 3, name: '윤태호' },
  cancelReason: null,
  cancelReasonDetail: null,
  occurredAt: '2026-09-23T10:30:00',
  minutesBeforeMeal: null,
  minutesAfterCompletion: null,
  afterAction: null,
  promotedHelper: null,
  promotedWaitingOrder: null,
  requestStatus: 'MATCHED',
  ...overrides,
});

describe('durationText', () => {
  it('한 시간이 안 되면 분, 넘으면 시간과 남은 분으로 쓴다', () => {
    expect(durationText(40)).toBe('40분');
    expect(durationText(1560)).toBe('26시간');
    expect(durationText(90)).toBe('1시간 30분');
  });
});

describe('historyReason', () => {
  it('도우미가 고른 인정 사유는 "인정 사유 · "를 앞에 붙인다', () => {
    expect(historyReason(history({ cancelReason: 'ACADEMIC' }))).toBe('인정 사유 · 학사 일정 변경');
  });

  it('기타 사유는 입력한 내용을 따옴표로 붙인다', () => {
    expect(
      historyReason(history({ cancelReason: 'OTHER', cancelReasonDetail: '알바 시간이 겹쳤어요' })),
    ).toBe('기타 · "알바 시간이 겹쳤어요"');
  });

  it('관리자 비활성화는 인정 사유로 표시하지 않는다', () => {
    expect(historyReason(history({ cancelReason: 'ADMIN_DEACTIVATED' }))).toBe('관리자 비활성화');
  });

  it('노쇼는 이용 완료 뒤 신고까지 걸린 시간을 쓰고, 학생 취소는 사유가 없다', () => {
    expect(historyReason(history({ type: 'NO_SHOW', minutesAfterCompletion: 180 }))).toBe(
      '학생 신고 (이용 후 3시간)',
    );
    expect(historyReason(history({ type: 'STUDENT_CANCELED', helper: null }))).toBeNull();
  });
});

describe('historyTiming', () => {
  it('식사 몇 분 전 취소인지 쓰고, 값이 없으면 null이다', () => {
    expect(historyTiming(history({ minutesBeforeMeal: 120 }))).toBe('식사 2시간 전');
    expect(historyTiming(history({ type: 'NO_SHOW' }))).toBeNull();
  });
});

describe('historyAfter', () => {
  it('예비 승격이면 승격 순번과 도우미 이름을 쓴다', () => {
    expect(
      historyAfter(
        history({
          afterAction: 'PROMOTED',
          promotedWaitingOrder: 1,
          promotedHelper: { id: 4, name: '오승민' },
        }),
      ),
    ).toBe('예비 1번(오승민) 승격');
  });

  it('모집 재개면 그 신청의 지금 상태를 이어 쓴다', () => {
    expect(historyAfter(history({ afterAction: 'REOPENED', requestStatus: 'FAILED' }))).toBe(
      '모집 재개 → 매칭 실패',
    );
  });

  it('노쇼는 봉사시간 제외, 학생 취소는 패널티 없음이다', () => {
    expect(historyAfter(history({ type: 'NO_SHOW' }))).toBe('봉사시간 제외');
    expect(historyAfter(history({ type: 'STUDENT_CANCELED' }))).toBe('패널티 없음');
  });
});

describe('promotionText', () => {
  const request = (promoted: boolean, promotedWaitingOrder: number | null) =>
    ({ promoted, promotedWaitingOrder }) as AdminStudentHelpRequest;

  it('승격된 도우미만 순번과 함께 표시하고, 순번 기록이 없으면 순번을 빼고 쓴다', () => {
    expect(promotionText(request(true, 1))).toBe('예비 1번 → 승격');
    expect(promotionText(request(true, null))).toBe('예비 → 승격');
    expect(promotionText(request(false, null))).toBeNull();
  });
});
