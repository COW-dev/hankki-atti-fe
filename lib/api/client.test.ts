import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('성공 응답이면 data만 돌려준다', async () => {
    // given
    mockFetch(200, {
      resultType: 'SUCCESS',
      httpStatusCode: 200,
      message: '성공',
      data: { id: 1 },
    });

    // when
    const result = await apiRequest<{ id: number }>('/api/me');

    // then
    expect(result).toEqual({ id: 1 });
  });

  it('refresh 쿠키가 가도록 credentials를 포함하고, 토큰이 있으면 Bearer로 보낸다', async () => {
    // given
    const fetchMock = mockFetch(200, {
      resultType: 'SUCCESS',
      httpStatusCode: 200,
      message: '성공',
    });

    // when
    await apiRequest('/api/auth/password', {
      method: 'PATCH',
      body: { a: 1 },
      accessToken: 'token',
    });

    // then
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe('include');
    expect(init.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    });
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it('실패 응답이면 상태 코드와 오류 code를 담은 ApiError를 던진다', async () => {
    // given
    mockFetch(401, {
      resultType: 'FAIL',
      httpStatusCode: 401,
      code: ErrorCode.LOGIN_FAILED,
      message: '아이디 또는 비밀번호가 올바르지 않습니다.',
    });

    // when
    const error = await apiRequest('/api/auth/login', { method: 'POST' }).catch((e: unknown) => e);

    // then
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: ErrorCode.LOGIN_FAILED });
  });

  it('서버에 닿지 못하면 status 0인 ApiError를 던진다', async () => {
    // given
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    // when
    const error = await apiRequest('/api/me').catch((e: unknown) => e);

    // then
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: undefined });
  });
});
