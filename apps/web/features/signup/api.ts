import { apiRequest, ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { toSignupRequest, type SignupField, type SignupForm } from './signup-form';

// L-02 도우미 회원가입 — 로그인 전이라 apiRequest. 토큰은 주지 않으므로 가입 뒤 로그인 화면으로 보낸다
export function signupHelper(form: SignupForm): Promise<void> {
  return apiRequest<void>('/api/helpers/signup', { method: 'POST', body: toSignupRequest(form) });
}

export type SignupFailure = { field?: SignupField; message: string };

// 중복은 해당 칸 오류로, 나머지는 화면 위 오류로 보인다. 문구는 목업에 없어 임시로 둔다
export function signupFailureOf(error: unknown): SignupFailure {
  if (error instanceof ApiError) {
    if (error.code === ErrorCode.HELPER_DUPLICATE_EMAIL) {
      return { field: 'email', message: '이미 가입된 이메일이에요' };
    }
    if (error.code === ErrorCode.HELPER_DUPLICATE_STUDENT_NO) {
      return { field: 'studentNo', message: '이미 가입된 학번이에요' };
    }
    if (error.code === ErrorCode.HELPER_SIGNUP_CONFLICT) {
      return { message: '잠시 후 다시 시도해 주세요' };
    }
    return { message: error.message };
  }
  return { message: '잠시 후 다시 시도해 주세요' };
}
