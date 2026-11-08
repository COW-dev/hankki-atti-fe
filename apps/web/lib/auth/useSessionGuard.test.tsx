import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useSessionGuard } from './useSessionGuard';

const replace = vi.fn();
const authRequest = vi.fn();
const router = { replace };
const auth = { status: 'authenticated', authRequest };

vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/lib/auth/AuthProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./AuthProvider')>()),
  useAuth: () => auth,
}));

describe('useSessionGuard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('허용한 역할이면 내 정보를 돌려준다', async () => {
    authRequest.mockResolvedValue({ role: 'HELPER' });

    const { result } = renderHook(() => useSessionGuard('HELPER'));

    await waitFor(() => expect(result.current).toEqual({ role: 'HELPER' }));
    expect(replace).not.toHaveBeenCalled();
  });

  it('장애학생이 도우미 화면에 오면 장애학생 첫 화면으로 보낸다', async () => {
    authRequest.mockResolvedValue({ role: 'STUDENT' });

    renderHook(() => useSessionGuard('HELPER'));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/requests'));
  });

  it('도우미가 장애학생 화면에 오면 도우미 첫 화면으로 보낸다', async () => {
    authRequest.mockResolvedValue({ role: 'HELPER' });

    renderHook(() => useSessionGuard('STUDENT'));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/helper/matches'));
  });

  it('관리자 API를 쓸 수 없는 토큰이면 로그인 화면으로 보낸다', async () => {
    authRequest.mockRejectedValue(new ApiError(403, undefined, ''));

    renderHook(() => useSessionGuard('ADMIN'));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
  });

  it('비밀번호 변경이 필요한 도우미는 도우미 변경 화면으로 보낸다', async () => {
    authRequest.mockRejectedValue(new ApiError(403, ErrorCode.PASSWORD_CHANGE_REQUIRED, ''));

    renderHook(() => useSessionGuard('HELPER'));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/helper/password/change'));
  });
});
