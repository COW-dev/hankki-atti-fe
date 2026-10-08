import { describe, expect, it } from 'vitest';
import { HELP_REQUEST_STATUS, helpTypesText } from '@/lib/labels/help-request';

describe('help-request labels', () => {
  it('상태마다 문구와 태그 톤이 있다', () => {
    expect(HELP_REQUEST_STATUS.RECRUITING).toEqual({ label: '모집 중', tone: 'progress' });
    expect(HELP_REQUEST_STATUS.MATCHED).toEqual({ label: '매칭 완료', tone: 'success' });
    expect(HELP_REQUEST_STATUS.COMPLETED.tone).toBe('ended');
    expect(HELP_REQUEST_STATUS.CANCELED).toEqual({ label: '취소 완료', tone: 'ended' });
    expect(HELP_REQUEST_STATUS.FAILED).toEqual({ label: '매칭 실패', tone: 'warning' });
    expect(HELP_REQUEST_STATUS.NO_SHOW).toEqual({ label: '노쇼', tone: 'error' });
  });

  it('도움 유형을 가운뎃점으로 잇고 기타는 내용을 붙인다', () => {
    expect(helpTypesText(['SERVING', 'SEATING'])).toBe('배식 보조 · 좌석 안내');
    expect(helpTypesText(['MOVING', 'OTHER'], '식판 반납')).toBe(
      '이동·운반 보조 · 기타: 식판 반납',
    );
    expect(helpTypesText(['OTHER'], null)).toBe('기타');
  });
});
