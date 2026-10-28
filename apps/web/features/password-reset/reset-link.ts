import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';

// 메일 링크 `/password-reset#token=…`의 토큰. # 뒤라 서버 로그·Referer에 남지 않는다 (백엔드 PasswordResetService)
export function readResetToken(hash: string): string | null {
  return new URLSearchParams(hash.replace(/^#/, '')).get('token') || null;
}

// 링크 확인·제출 실패: 만료(30분·사용됨·새 요청으로 무효) · 지금 비밀번호와 같음 · 그 밖은 다시 시도
export type ResetFailure = 'expired' | 'sameAsCurrent' | 'retry';

export function resetFailure(error: unknown): ResetFailure {
  if (!(error instanceof ApiError)) return 'retry';
  if (error.code === ErrorCode.PASSWORD_RESET_LINK_INVALID) return 'expired';
  if (error.code === ErrorCode.SAME_AS_CURRENT_PASSWORD) return 'sameAsCurrent';
  return 'retry';
}
