import { describe, expect, it } from 'vitest';
import {
  APPLICATION_STATUS,
  CANCEL_REASONS,
  CANCEL_REASON_LABEL,
  applicationStatusLabel,
} from '@/lib/labels/application';

describe('application labels', () => {
  it('진행 중 상태는 성공·진행 태그, 지난 상태는 종료·경고·오류 태그다', () => {
    expect(APPLICATION_STATUS.MATCHED).toEqual({ label: '매칭 완료', type: 'success' });
    expect(APPLICATION_STATUS.PROMOTION_PENDING).toEqual({
      label: '승격 응답 대기',
      type: 'progress',
    });
    expect(APPLICATION_STATUS.WAITING.type).toBe('progress');
    expect(APPLICATION_STATUS.EXCLUDED).toEqual({ label: '자동 제외', type: 'ended' });
    expect(APPLICATION_STATUS.STUDENT_CANCELED).toEqual({ label: '취소됨', type: 'ended' });
    expect(APPLICATION_STATUS.HELPER_CANCELED).toEqual({ label: '취소', type: 'warning' });
    expect(APPLICATION_STATUS.COMPLETED).toEqual({ label: '이용 완료', type: 'ended' });
    expect(APPLICATION_STATUS.NO_SHOW).toEqual({ label: '노쇼', type: 'error' });
  });

  it('예비는 순번을 붙여 "예비 N번"으로 읽는다', () => {
    expect(applicationStatusLabel('WAITING', 2)).toBe('예비 2번');
    expect(applicationStatusLabel('WAITING')).toBe('예비');
    expect(applicationStatusLabel('MATCHED', 2)).toBe('매칭 완료');
  });

  it('취소 사유 선택지는 목업 순서 4개이고 관리자 비활성화는 없다', () => {
    expect(CANCEL_REASONS).toEqual(['ILLNESS', 'ACADEMIC', 'FAMILY', 'OTHER']);
    expect(CANCEL_REASONS.map((reason) => CANCEL_REASON_LABEL[reason])).toEqual([
      '질병·부상',
      '학사 일정 변경 (시험·보강)',
      '가족 경조사',
      '기타 (직접 입력)',
    ]);
  });
});
