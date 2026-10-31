import { describe, expect, it } from 'vitest';
import { toSignupRequest, validateSignup, type SignupForm } from '@/features/signup/signup-form';

const VALID: SignupForm = {
  name: '이도움',
  studentNo: '60231234',
  email: 'helper@mju.ac.kr',
  kakaoId: 'hankki_helper',
  phone: '010-1234-5678',
  password: 'hankki!2026',
  passwordConfirm: 'hankki!2026',
  attiMember: false,
};

describe('validateSignup', () => {
  it('모든 칸이 규칙에 맞으면 오류가 없다', () => {
    expect(validateSignup(VALID)).toEqual({});
  });

  it('하이픈 없는 전화번호와 대문자 학교 이메일도 받는다', () => {
    expect(validateSignup({ ...VALID, phone: '01012345678', email: 'Helper@MJU.ac.kr' })).toEqual(
      {},
    );
  });

  it.each([
    ['name', { name: '  ' }],
    ['studentNo', { studentNo: '6023123' }],
    ['studentNo', { studentNo: '6023123a' }],
    ['email', { email: 'helper@gmail.com' }],
    ['kakaoId', { kakaoId: '' }],
    ['kakaoId', { kakaoId: 'hankki helper' }],
    ['phone', { phone: '02-300-1529' }],
    ['password', { password: 'hankki2026', passwordConfirm: 'hankki2026' }],
    ['passwordConfirm', { passwordConfirm: 'hankki!2027' }],
  ] as const)('%s 규칙을 어기면 그 칸만 오류다 (%o)', (field, change) => {
    expect(Object.keys(validateSignup({ ...VALID, ...change }))).toEqual([field]);
  });

  // 백엔드 HelperSignupRequestDto 이름 @Size(max = 50), KakaoId @Size(max = 50)
  it('이름은 앞뒤 공백을 뺀 50자까지, 카톡 ID는 50자까지 받는다', () => {
    expect(
      validateSignup({ ...VALID, name: ` ${'가'.repeat(50)} `, kakaoId: 'a'.repeat(50) }),
    ).toEqual({});
  });

  it.each([
    ['name', { name: '가'.repeat(51) }],
    ['kakaoId', { kakaoId: 'a'.repeat(51) }],
  ] as const)('%s가 51자면 그 칸만 오류다', (field, change) => {
    expect(Object.keys(validateSignup({ ...VALID, ...change }))).toEqual([field]);
  });

  it('비밀번호가 64자를 넘으면 오류다', () => {
    const long = `a1!${'a'.repeat(62)}`;
    expect(
      validateSignup({ ...VALID, password: long, passwordConfirm: long }).password,
    ).toBeDefined();
  });
});

describe('toSignupRequest', () => {
  it('이메일은 소문자로, 앞뒤 공백은 지우고, 안내 자료 확인을 true로 보낸다', () => {
    const body = toSignupRequest({ ...VALID, name: ' 이도움 ', email: ' Helper@MJU.ac.kr ' });

    expect(body).toEqual({
      name: '이도움',
      studentNo: '60231234',
      email: 'helper@mju.ac.kr',
      phone: '010-1234-5678',
      kakaoId: 'hankki_helper',
      password: 'hankki!2026',
      attiMember: false,
      guideConfirmed: true,
    });
  });
});
