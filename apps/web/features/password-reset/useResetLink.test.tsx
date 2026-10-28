import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useResetLink } from '@/features/password-reset/useResetLink';
import { ApiError } from '@/lib/api/client';

const verify = vi.fn();
const confirm = vi.fn();
vi.mock('@/features/password-reset/api', () => ({
  verifyPasswordReset: (token: string) => verify(token),
  confirmPasswordReset: (token: string, password: string) => confirm(token, password),
}));

const LINK_INVALID = new ApiError(410, 'AUTH_PASSWORD_RESET_LINK_INVALID', '링크가 만료됐어요');

async function renderReady() {
  verify.mockResolvedValueOnce(undefined);
  const hook = renderHook(() => useResetLink('t0k'));
  await waitFor(() => expect(hook.result.current.status).toBe('ready'));
  return hook;
}

describe('useResetLink', () => {
  beforeEach(() => {
    verify.mockReset();
    confirm.mockReset();
  });

  it('링크를 먼저 확인하고, 쓸 수 있으면 ready', async () => {
    await renderReady();

    expect(verify).toHaveBeenCalledWith('t0k');
  });

  it('확인에서 링크가 무효면 입력 전에 expired', async () => {
    verify.mockRejectedValueOnce(LINK_INVALID);

    const { result } = renderHook(() => useResetLink('t0k'));

    await waitFor(() => expect(result.current.status).toBe('expired'));
  });

  it('새 비밀번호를 바꾸면 done', async () => {
    // given
    const { result } = await renderReady();
    confirm.mockResolvedValueOnce(undefined);

    // when
    await act(() => result.current.submit('hankki!2026'));

    // then
    expect(confirm).toHaveBeenCalledWith('t0k', 'hankki!2026');
    expect(result.current.status).toBe('done');
  });

  it('입력하는 사이 링크가 무효가 되면 제출 때 expired', async () => {
    const { result } = await renderReady();
    confirm.mockRejectedValueOnce(LINK_INVALID);

    await act(() => result.current.submit('hankki!2026'));

    expect(result.current.status).toBe('expired');
  });

  it('지금 비밀번호와 같으면 입력 칸 오류로 알리고 폼에 남는다', async () => {
    const { result } = await renderReady();
    confirm.mockRejectedValueOnce(
      new ApiError(400, 'AUTH_SAME_AS_CURRENT_PASSWORD', '같은 비밀번호예요'),
    );

    await act(() => result.current.submit('hankki!2026'));

    expect(result.current.status).toBe('ready');
    expect(result.current.passwordError).toBe('지금 쓰는 비밀번호와 다르게 만들어 주세요');
  });

  it('확인이 네트워크 오류로 실패하면 error, 다시 시도하면 다시 확인한다', async () => {
    // given
    verify.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useResetLink('t0k'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    verify.mockResolvedValueOnce(undefined);

    // when
    act(() => result.current.retry());

    // then
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(verify).toHaveBeenCalledTimes(2);
  });
});
