import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signupFailureOf, signupHelper } from '@/features/signup/api';
import { ApiError } from '@/lib/api/client';

const apiRequest = vi.fn();
vi.mock('@/lib/api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/client')>()),
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

describe('signupHelper', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue({ accountId: 1, loginId: 'helper@mju.ac.kr' });
  });

  it('로그인 없이 가입 경로로 POST하고 안내 자료 확인을 함께 보낸다', async () => {
    await signupHelper({
      name: '이도움',
      studentNo: '60231234',
      email: 'Helper@mju.ac.kr',
      kakaoId: 'hankki_helper',
      phone: '01012345678',
      password: 'hankki!2026',
      passwordConfirm: 'hankki!2026',
      attiMember: true,
    });

    expect(apiRequest).toHaveBeenCalledWith('/api/helpers/signup', {
      method: 'POST',
      body: {
        name: '이도움',
        studentNo: '60231234',
        email: 'helper@mju.ac.kr',
        phone: '01012345678',
        kakaoId: 'hankki_helper',
        password: 'hankki!2026',
        attiMember: true,
        guideConfirmed: true,
      },
    });
  });
});

describe('signupFailureOf', () => {
  it('이미 가입된 이메일이면 이메일 칸 오류다', () => {
    expect(signupFailureOf(new ApiError(409, 'HELPER_DUPLICATE_EMAIL', '중복'))).toEqual({
      field: 'email',
      message: '이미 가입된 이메일이에요',
    });
  });

  it('이미 가입된 학번이면 학번 칸 오류다', () => {
    expect(signupFailureOf(new ApiError(409, 'HELPER_DUPLICATE_STUDENT_NO', '중복'))).toEqual({
      field: 'studentNo',
      message: '이미 가입된 학번이에요',
    });
  });

  it('가입 요청이 겹치면 칸 없이 다시 시도를 안내한다', () => {
    expect(signupFailureOf(new ApiError(409, 'HELPER_SIGNUP_CONFLICT', '충돌'))).toEqual({
      message: '잠시 후 다시 시도해 주세요',
    });
  });

  it('그 밖의 서버 오류(422·연결 실패)는 서버 문구를 화면 위에 보인다', () => {
    expect(
      signupFailureOf(new ApiError(422, 'COMMON_INVALID_INPUT', '입력값을 확인해 주세요')),
    ).toEqual({ message: '입력값을 확인해 주세요' });
    expect(signupFailureOf(new TypeError('boom'))).toEqual({
      message: '잠시 후 다시 시도해 주세요',
    });
  });
});
