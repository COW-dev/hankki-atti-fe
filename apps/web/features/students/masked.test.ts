import { describe, expect, it } from 'vitest';
import { maskEmail, maskedReading } from '@/features/students/masked';

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

describe('maskEmail', () => {
  it('아이디 앞 4글자만 남기고 가린다', () => {
    expect(maskEmail('60231234@mju.ac.kr')).toBe('6023****@mju.ac.kr');
  });

  it('아이디가 4글자보다 짧으면 있는 글자 뒤에 가림 표시를 붙인다', () => {
    expect(maskEmail('ab@mju.ac.kr')).toBe('ab****@mju.ac.kr');
  });
});
