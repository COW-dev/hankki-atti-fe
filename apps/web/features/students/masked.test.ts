import { describe, expect, it } from 'vitest';
import { maskedReading } from '@/features/students/masked';

describe('maskedReading', () => {
  it('가린 전화번호면 끝자리만 읽는다', () => {
    expect(maskedReading('010-****-5678')).toBe('끝자리 5678');
  });

  it('가린 이메일·카톡 ID면 가린 부분을 "가림"으로 읽는다', () => {
    expect(maskedReading('st*****@mju.ac.kr')).toBe('st, 가림, @mju.ac.kr');
    expect(maskedReading('ha**********')).toBe('ha, 가림');
  });

  it('가린 곳이 없으면 그대로 읽는다', () => {
    expect(maskedReading('min_k')).toBe('min_k');
  });
});
