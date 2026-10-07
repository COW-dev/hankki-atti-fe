import { describe, expect, it } from 'vitest';
import { checkPassword } from '@/lib/auth/password-policy';

const passedLabels = (value: string) =>
  checkPassword(value)
    .filter((rule) => rule.passed)
    .map((rule) => rule.label);

describe('checkPassword', () => {
  it('영문·숫자·특수문자를 모두 넣은 8자 이상이면 4개 규칙을 모두 통과한다', () => {
    expect(passedLabels('hankki1!')).toEqual([
      '8자 이상',
      '영문 포함',
      '숫자 포함',
      '특수문자 포함',
    ]);
  });

  it('7자면 길이 규칙만 통과하지 못한다', () => {
    expect(passedLabels('hank1!a')).toEqual(['영문 포함', '숫자 포함', '특수문자 포함']);
  });

  it('공백은 특수문자로 치지 않는다', () => {
    expect(passedLabels('hankki 12')).toEqual(['8자 이상', '영문 포함', '숫자 포함']);
  });
});
