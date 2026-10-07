import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';

const ok = (data: unknown) =>
  new Response(
    JSON.stringify({ resultType: 'SUCCESS', httpStatusCode: 200, message: '성공', data }),
    { status: 200 },
  );
const fail = (status: number, code: string) =>
  new Response(
    JSON.stringify({ resultType: 'FAIL', httpStatusCode: status, code, message: '실패' }),
    { status },
  );

const pathOf = (call: unknown[]) => new URL(call[0] as string).pathname;

function Probe() {
  const { status, authRequest } = useAuth();
  return (
    <>
      <p>상태: {status}</p>
      <button type="button" onClick={() => authRequest('/api/me')}>
        내 정보
      </button>
    </>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AuthProvider', () => {
  it('개발 모드처럼 effect가 두 번 실행돼도 재발급 요청은 한 번만 보낸다', async () => {
    // given — 같은 refresh 토큰을 두 번 쓰면 서버가 탈취로 보고 계정의 토큰을 모두 폐기한다
    const fetchMock = vi.fn().mockResolvedValue(ok({ accessToken: 'a1', expiresIn: 1800 }));
    vi.stubGlobal('fetch', fetchMock);

    // when
    render(
      <StrictMode>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </StrictMode>,
    );

    // then
    await screen.findByText('상태: authenticated');
    expect(
      fetchMock.mock.calls.filter((call) => pathOf(call) === '/api/auth/refresh'),
    ).toHaveLength(1);
  });

  it('refresh 쿠키가 없으면 로그인 전 상태가 된다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(401, 'AUTH_UNAUTHENTICATED')));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(await screen.findByText('상태: anonymous')).toBeInTheDocument();
  });

  it('access 토큰이 만료돼 401을 받으면 한 번 재발급받고 새 토큰으로 다시 보낸다', async () => {
    // given
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok({ accessToken: 'old', expiresIn: 1800 })) // 첫 화면 재발급
      .mockResolvedValueOnce(fail(401, 'AUTH_UNAUTHENTICATED')) // 만료된 토큰
      .mockResolvedValueOnce(ok({ accessToken: 'new', expiresIn: 1800 })) // 재발급
      .mockResolvedValueOnce(ok({ accountId: 1 })); // 다시 보낸 요청
    vi.stubGlobal('fetch', fetchMock);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await screen.findByText('상태: authenticated');

    // when
    await userEvent.click(screen.getByRole('button', { name: '내 정보' }));

    // then
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    expect(fetchMock.mock.calls.map(pathOf)).toEqual([
      '/api/auth/refresh',
      '/api/me',
      '/api/auth/refresh',
      '/api/me',
    ]);
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe('Bearer new');
  });
});
