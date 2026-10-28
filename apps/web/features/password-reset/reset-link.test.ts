import { describe, expect, it } from 'vitest';
import { readResetToken, resetFailure } from '@/features/password-reset/reset-link';
import { ApiError } from '@/lib/api/client';

describe('readResetToken', () => {
  it('# 뒤 token 값을 읽는다', () => {
    expect(readResetToken('#token=q1w2e3')).toBe('q1w2e3');
  });

  it('토큰이 없거나 비어 있으면 null', () => {
    expect(readResetToken('')).toBeNull();
    expect(readResetToken('#token=')).toBeNull();
    expect(readResetToken('#other=1')).toBeNull();
  });
});

describe('resetFailure', () => {
  it('링크 무효(410)는 만료, 같은 비밀번호는 sameAsCurrent', () => {
    expect(
      resetFailure(new ApiError(410, 'AUTH_PASSWORD_RESET_LINK_INVALID', '링크가 만료됐어요')),
    ).toBe('expired');
    expect(
      resetFailure(new ApiError(400, 'AUTH_SAME_AS_CURRENT_PASSWORD', '같은 비밀번호예요')),
    ).toBe('sameAsCurrent');
  });

  it('그 밖의 서버 오류·네트워크 오류는 다시 시도', () => {
    expect(resetFailure(new ApiError(500, undefined, '서버 오류'))).toBe('retry');
    expect(resetFailure(new TypeError('Failed to fetch'))).toBe('retry');
  });
});
