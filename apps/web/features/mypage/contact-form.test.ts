import { describe, expect, it } from 'vitest';
import { validateContact } from '@/features/mypage/contact-form';

describe('validateContact', () => {
  it('규칙에 맞으면 오류가 없고 하이픈 없는 전화번호도 받는다', () => {
    expect(validateContact({ kakaoId: 'hankki_helper', phone: '01012345678' })).toEqual({});
  });

  it('카톡 ID에 띄어쓰기가 있으면 카톡 ID 오류를 돌려준다', () => {
    const errors = validateContact({ kakaoId: 'hankki helper', phone: '010-1234-5678' });

    expect(errors).toEqual({ kakaoId: '카톡 ID에는 띄어쓰기를 쓸 수 없어요' });
  });

  it('카톡 ID가 50자를 넘으면 카톡 ID 오류를 돌려준다', () => {
    const errors = validateContact({ kakaoId: 'a'.repeat(51), phone: '010-1234-5678' });

    expect(errors).toEqual({ kakaoId: '카톡 ID는 50자까지 쓸 수 있어요' });
  });

  it('비었거나 형식이 틀리면 칸마다 오류를 돌려준다', () => {
    const errors = validateContact({ kakaoId: '', phone: '02-300-1529' });

    expect(errors).toEqual({
      kakaoId: '카톡 ID를 입력해 주세요',
      phone: '전화번호를 010-0000-0000처럼 입력해 주세요',
    });
  });
});
