import { describe, expect, it } from 'vitest';
import {
  APPLY_OUTCOME,
  BLOCK_REASON_LABEL,
  HELP_REQUEST_STATUS,
  adminRequestStatusTags,
  helpTypesText,
} from '@/lib/labels/help-request';

describe('help-request labels', () => {
  it('상태마다 문구와 태그 톤이 있다', () => {
    expect(HELP_REQUEST_STATUS.RECRUITING).toEqual({ label: '모집 중', tone: 'progress' });
    expect(HELP_REQUEST_STATUS.MATCHED).toEqual({ label: '매칭 완료', tone: 'success' });
    expect(HELP_REQUEST_STATUS.COMPLETED.tone).toBe('ended');
    expect(HELP_REQUEST_STATUS.CANCELED).toEqual({ label: '취소 완료', tone: 'ended' });
    expect(HELP_REQUEST_STATUS.FAILED).toEqual({ label: '매칭 실패', tone: 'warning' });
    expect(HELP_REQUEST_STATUS.NO_SHOW).toEqual({ label: '노쇼', tone: 'error' });
  });

  it('지원 결과 예고마다 태그 톤·문구·버튼 문구가 있고 지원 불가는 버튼이 없다', () => {
    expect(APPLY_OUTCOME.MATCH).toEqual({
      label: '바로 매칭',
      tone: 'progress',
      action: '지원하기',
    });
    expect(APPLY_OUTCOME.WAITING).toEqual({
      label: '예비 등록',
      tone: 'neutral',
      action: '예비로 지원',
    });
    expect(APPLY_OUTCOME.BLOCKED).toEqual({ label: '지원 불가', tone: 'ended', action: null });
  });

  it('지원 불가 사유마다 안내 문구가 있다', () => {
    expect(BLOCK_REASON_LABEL.ALREADY_APPLIED).toBe('이미 지원한 요청이에요');
    expect(BLOCK_REASON_LABEL.TIME_OVERLAP).toBe('같은 시간에 매칭된 일정이 있어요');
    expect(BLOCK_REASON_LABEL.WAITING_FULL).toBe('예비 인원이 다 찼어요');
  });

  it('도움 유형을 가운뎃점으로 잇고 기타는 내용을 붙인다', () => {
    expect(helpTypesText(['SERVING', 'SEATING'])).toBe('배식 보조 · 좌석 안내');
    expect(helpTypesText(['MOVING', 'OTHER'], '식판 반납')).toBe(
      '이동·운반 보조 · 기타: 식판 반납',
    );
    expect(helpTypesText(['OTHER'], null)).toBe('기타');
  });

  describe('adminRequestStatusTags', () => {
    const row = {
      status: 'MATCHED' as const,
      cancelType: null,
      promotionPending: false,
      helperChanged: false,
    };

    it('모집 중이면 승격 응답 대기 여부를 붙이고, 노쇼는 신고로 쓴다', () => {
      expect(adminRequestStatusTags({ ...row, status: 'RECRUITING' })).toEqual([
        { label: '모집 중 · 지원자 없음', tone: 'progress' },
      ]);
      expect(
        adminRequestStatusTags({ ...row, status: 'RECRUITING', promotionPending: true }),
      ).toEqual([{ label: '모집 중 · 승격 응답 대기', tone: 'progress' }]);
      expect(adminRequestStatusTags({ ...row, status: 'NO_SHOW' })).toEqual([
        { label: '노쇼 신고', tone: 'error' },
      ]);
    });

    it('취소면 취소 구분을 붙이고, 도우미가 바뀌었으면 중립 태그를 하나 더 둔다', () => {
      expect(
        adminRequestStatusTags({ ...row, status: 'CANCELED', cancelType: 'STUDENT_WITHDRAW' }),
      ).toEqual([{ label: '취소 완료 · 신청 철회', tone: 'ended' }]);
      expect(adminRequestStatusTags({ ...row, helperChanged: true })).toEqual([
        { label: '매칭 완료', tone: 'success' },
        { label: '도우미 바뀜', tone: 'neutral' },
      ]);
    });
  });
});
