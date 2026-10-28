import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilitySync } from '@/lib/accessibility/AccessibilitySync';
import { loginEvents } from '@/lib/accessibility/login-event';
import { textSizeStore } from '@/lib/accessibility/text-size';
import { ApiError } from '@/lib/api/client';

const authRequest = vi.fn();
let status: 'loading' | 'authenticated' | 'anonymous' = 'authenticated';
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ status, authRequest }),
}));

let pathname = '/requests';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

const values = new Map<string, string>();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function settingsCalls() {
  return authRequest.mock.calls.filter(([path]) => path === '/api/me/settings');
}

describe('AccessibilitySync', () => {
  beforeEach(() => {
    values.clear();
    // 테스트 환경에서는 Node의 localStorage가 jsdom 것을 가리므로 메모리 저장소로 바꿔 둔다
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    authRequest.mockReset();
    status = 'authenticated';
    pathname = '/requests';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  it('로그인 상태가 되면 계정 설정을 받아 기기 설정보다 우선 적용한다', async () => {
    // given: 이 기기는 꺼져 있고 계정은 켜져 있다 (다른 기기·관리자 등록 기본값)
    textSizeStore.applyAccount(false);
    authRequest.mockResolvedValueOnce({ accessibilityMode: true });

    // when
    render(<AccessibilitySync />);

    // then
    expect(authRequest).toHaveBeenCalledWith('/api/me');
    await waitFor(() => expect(textSizeStore.getSnapshot()).toBe(true));
  });

  it('로그인 전이면 계정 설정을 받지 않고 토글도 계정에 저장하지 않는다', () => {
    status = 'anonymous';
    render(<AccessibilitySync />);

    act(() => textSizeStore.setByUser(true));

    expect(authRequest).not.toHaveBeenCalled();
    expect(textSizeStore.getSnapshot()).toBe(true);
  });

  it('계정 값이 오기 전에 사용자가 토글을 바꾸면 늦게 온 계정 값으로 덮지 않는다', async () => {
    // given
    const me = deferred<{ accessibilityMode: boolean }>();
    authRequest.mockReturnValueOnce(me.promise).mockResolvedValue({});
    render(<AccessibilitySync />);

    // when
    act(() => textSizeStore.setByUser(true));
    await act(async () => me.resolve({ accessibilityMode: false }));

    // then
    expect(textSizeStore.getSnapshot()).toBe(true);
  });

  it('토글을 바꾸면 계정에도 저장한다', async () => {
    authRequest.mockResolvedValueOnce({ accessibilityMode: false }).mockResolvedValue({});
    render(<AccessibilitySync />);
    await waitFor(() => expect(authRequest).toHaveBeenCalledTimes(1));

    act(() => textSizeStore.setByUser(true));

    await waitFor(() =>
      expect(authRequest).toHaveBeenCalledWith('/api/me/settings', {
        method: 'PATCH',
        body: { accessibilityMode: true },
      }),
    );
  });

  it('빠르게 여러 번 바꾸면 하나씩 보내고 마지막 값으로 끝낸다', async () => {
    // given
    authRequest.mockResolvedValueOnce({ accessibilityMode: false });
    render(<AccessibilitySync />);
    await waitFor(() => expect(authRequest).toHaveBeenCalledTimes(1));
    const first = deferred<object>();
    authRequest.mockReturnValueOnce(first.promise).mockResolvedValue({});

    // when: 켬 → (응답 전) 끔 → 켬 → 끔
    act(() => {
      textSizeStore.setByUser(true);
      textSizeStore.setByUser(false);
      textSizeStore.setByUser(true);
      textSizeStore.setByUser(false);
    });
    expect(settingsCalls()).toHaveLength(1);
    await act(async () => first.resolve({}));

    // then: 첫 요청이 끝난 뒤 마지막 값 하나만 더 보낸다
    await waitFor(() => expect(settingsCalls()).toHaveLength(2));
    expect(settingsCalls().map(([, options]) => options.body.accessibilityMode)).toEqual([
      true,
      false,
    ]);
  });

  it('계정 저장이 실패하면 토스트로 알리고 기기 설정은 그대로 둔다', async () => {
    authRequest
      .mockResolvedValueOnce({ accessibilityMode: false })
      .mockRejectedValueOnce(new ApiError(500, undefined, '서버 오류'));
    render(<AccessibilitySync />);
    await waitFor(() => expect(authRequest).toHaveBeenCalledTimes(1));

    act(() => textSizeStore.setByUser(true));

    expect(
      await screen.findByText('계정에 저장하지 못했어요. 이 기기에서만 바뀌어요'),
    ).toBeVisible();
    expect(textSizeStore.getSnapshot()).toBe(true);
  });

  it('첫 로그인은 비밀번호를 바꾼 뒤 다음 화면에서 계정 값(센터가 켠 기본값)을 적용한다', async () => {
    // given: S-PW 화면에서는 /api/me가 403
    textSizeStore.applyAccount(false);
    pathname = '/password/change';
    authRequest
      .mockRejectedValueOnce(new ApiError(403, 'AUTH_PASSWORD_CHANGE_REQUIRED', '변경 필요'))
      .mockResolvedValueOnce({ accessibilityMode: true });
    const { rerender } = render(<AccessibilitySync />);
    await waitFor(() => expect(authRequest).toHaveBeenCalledTimes(1));
    expect(textSizeStore.getSnapshot()).toBe(false);

    // when: 비밀번호를 바꾸고 첫 화면으로 이동
    pathname = '/';
    rerender(<AccessibilitySync />);

    // then
    await waitFor(() => expect(textSizeStore.getSnapshot()).toBe(true));
    expect(authRequest).toHaveBeenCalledTimes(2);
  });

  it('계정 값을 적용한 뒤에는 화면을 옮겨도 다시 받지 않는다', async () => {
    authRequest.mockResolvedValueOnce({ accessibilityMode: false });
    const { rerender } = render(<AccessibilitySync />);
    await waitFor(() => expect(authRequest).toHaveBeenCalledTimes(1));

    pathname = '/notices';
    rerender(<AccessibilitySync />);

    expect(authRequest).toHaveBeenCalledTimes(1);
  });

  it('비밀번호 변경 전에 바꾼 토글 값은 계정을 쓸 수 있게 되면 계정에 저장한다', async () => {
    // given: S-PW 화면에서 토글을 켰지만 계정 저장은 403
    pathname = '/password/change';
    const passwordChange = new ApiError(403, 'AUTH_PASSWORD_CHANGE_REQUIRED', '변경 필요');
    authRequest
      .mockRejectedValueOnce(passwordChange)
      .mockRejectedValueOnce(passwordChange)
      .mockResolvedValueOnce({ accessibilityMode: false })
      .mockResolvedValue({});
    const { rerender } = render(<AccessibilitySync />);
    await waitFor(() => expect(authRequest).toHaveBeenCalledTimes(1));
    act(() => textSizeStore.setByUser(true));
    await waitFor(() => expect(settingsCalls()).toHaveLength(1));

    // when: 비밀번호를 바꾸고 첫 화면으로 이동
    pathname = '/';
    rerender(<AccessibilitySync />);

    // then: 계정의 예전 값(false)으로 덮지 않고, 고른 값(true)을 계정에 저장한다
    await waitFor(() => expect(settingsCalls()).toHaveLength(2));
    expect(settingsCalls()[1][1].body).toEqual({ accessibilityMode: true });
    expect(textSizeStore.getSnapshot()).toBe(true);
  });

  it('로그인한 채 다른 계정으로 로그인하면 새 계정의 설정으로 다시 맞춘다', async () => {
    // given: 앞 계정(꺼짐)을 이미 적용했다
    authRequest
      .mockResolvedValueOnce({ accessibilityMode: false })
      .mockResolvedValueOnce({ accessibilityMode: true });
    render(<AccessibilitySync />);
    await waitFor(() => expect(authRequest).toHaveBeenCalledTimes(1));

    // when: status는 authenticated 그대로인 채 새 계정으로 로그인
    act(() => loginEvents.notify());

    // then
    await waitFor(() => expect(textSizeStore.getSnapshot()).toBe(true));
    expect(authRequest).toHaveBeenCalledTimes(2);
  });

  it('비밀번호 변경 전 계정이면 계정 저장 실패를 알리지 않는다', async () => {
    authRequest
      .mockRejectedValueOnce(new ApiError(403, 'AUTH_PASSWORD_CHANGE_REQUIRED', '변경 필요'))
      .mockRejectedValueOnce(new ApiError(403, 'AUTH_PASSWORD_CHANGE_REQUIRED', '변경 필요'));
    render(<AccessibilitySync />);

    act(() => textSizeStore.setByUser(true));

    await waitFor(() => expect(settingsCalls()).toHaveLength(1));
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
