import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordReset,
} from '@/features/password-reset/api';

const apiRequest = vi.fn();
vi.mock('@/lib/api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/client')>()),
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

describe('password reset api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue(undefined);
  });

  it('요청·확인·완료를 로그인 없이 각 경로로 POST한다', async () => {
    await requestPasswordReset('60231234');
    await verifyPasswordReset('t0k');
    await confirmPasswordReset('t0k', 'hankki!2026');

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/auth/password-reset/request', {
      method: 'POST',
      body: { loginId: '60231234' },
    });
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/auth/password-reset/verify', {
      method: 'POST',
      body: { token: 't0k' },
    });
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/api/auth/password-reset/confirm', {
      method: 'POST',
      body: { token: 't0k', newPassword: 'hankki!2026' },
    });
  });
});
