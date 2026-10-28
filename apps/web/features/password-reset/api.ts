import { apiRequest } from '@/lib/api/client';

// L-03 비밀번호 재설정 — 로그인 전이라 apiRequest를 쓴다. 세 API 모두 성공하면 데이터가 없다

// 계정이 없어도, 10분 안에 다시 요청해도 같은 성공 응답이다 (계정 유무를 드러내지 않는다)
export function requestPasswordReset(loginId: string): Promise<void> {
  return apiRequest<void>('/api/auth/password-reset/request', {
    method: 'POST',
    body: { loginId },
  });
}

// 메일 링크를 열었을 때 아직 쓸 수 있는지만 확인한다 (토큰을 쓰지 않는다)
export function verifyPasswordReset(token: string): Promise<void> {
  return apiRequest<void>('/api/auth/password-reset/verify', { method: 'POST', body: { token } });
}

// 새 비밀번호로 바꾸고 모든 기기에서 로그아웃시킨다
export function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  return apiRequest<void>('/api/auth/password-reset/confirm', {
    method: 'POST',
    body: { token, newPassword },
  });
}
