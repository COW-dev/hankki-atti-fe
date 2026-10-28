import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppNotification, NotificationPage } from '@/features/notifications/types';
import {
  UNREAD_POLL_INTERVAL_MS,
  useNotifications,
} from '@/features/notifications/useNotifications';
import { ApiError } from '@/lib/api/client';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest }),
}));

function notification(id: number, message: string, read = false): AppNotification {
  return {
    id,
    type: 'REQUEST_MATCHED',
    message,
    targetType: 'HELP_REQUEST',
    targetId: id,
    read,
    createdAt: '2026-10-28T12:00:00',
  };
}

const PAGE: NotificationPage = {
  items: [notification(2, '12:00 식사 도우미가 정해졌어요'), notification(1, '이전 알림', true)],
  nextCursor: null,
};

// 서버 흉내: 경로별 응답. count는 테스트 중에 바꾼다
let unread = 1;
let page: NotificationPage = PAGE;
function serve(path: string, options?: { method?: string }) {
  if (path === '/api/notifications/unread-count') return Promise.resolve({ count: unread });
  if (path.startsWith('/api/notifications?') || path === '/api/notifications') {
    return Promise.resolve(page);
  }
  if (path === '/api/notifications/read-all' && options?.method === 'PATCH') {
    return Promise.resolve({ readCount: unread });
  }
  if (path.endsWith('/read') && options?.method === 'PATCH') return Promise.resolve({});
  return Promise.reject(new Error(`예상하지 못한 요청: ${path}`));
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
}

async function renderEntered() {
  const hook = renderHook(() => useNotifications(true));
  await waitFor(() => expect(hook.result.current.unreadCount).toBe(unread));
  return hook;
}

describe('useNotifications', () => {
  beforeEach(() => {
    unread = 1;
    page = PAGE;
    authRequest.mockReset();
    authRequest.mockImplementation(serve);
    setVisibility('visible');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('화면에 들어오면 안 읽은 개수를 받고 새 알림으로 읽지 않는다', async () => {
    const { result } = await renderEntered();

    expect(authRequest).toHaveBeenCalledWith('/api/notifications/unread-count');
    expect(result.current.announcement).toBeNull();
    expect(result.current.open).toBe(false);
  });

  it('주기 조회에서 개수가 늘면 가장 최근 알림을 polite로 읽는다', async () => {
    // given
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = await renderEntered();
    unread = 2;

    // when
    await act(() => vi.advanceTimersByTimeAsync(UNREAD_POLL_INTERVAL_MS));

    // then
    expect(result.current.unreadCount).toBe(2);
    expect(result.current.announcement?.text).toBe('새 알림: 12:00 식사 도우미가 정해졌어요');
  });

  it('탭이 숨어 있으면 주기 조회를 하지 않고, 다시 보이면 바로 받는다', async () => {
    // given
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = await renderEntered();
    setVisibility('hidden');
    authRequest.mockClear();

    // when
    await act(() => vi.advanceTimersByTimeAsync(UNREAD_POLL_INTERVAL_MS * 2));

    // then
    expect(authRequest).not.toHaveBeenCalled();

    unread = 3;
    setVisibility('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(() => expect(result.current.unreadCount).toBe(3));
  });

  it('패널을 열면 목록을 받고, 모두 읽음이면 개수 0·전부 읽음으로 바꾸고 알린다', async () => {
    // given
    const { result } = await renderEntered();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.list.status).toBe('ready'));

    // when
    await act(() => result.current.markAllRead());

    // then
    expect(authRequest).toHaveBeenCalledWith('/api/notifications/read-all', { method: 'PATCH' });
    expect(result.current.unreadCount).toBe(0);
    const { list } = result.current;
    expect(list.status === 'ready' && list.items.every((item) => item.read)).toBe(true);
    expect(result.current.announcement?.text).toBe('알림을 모두 읽었어요');
  });

  it('모두 읽음이 실패하면 패널 안에 오류를 보이고 개수는 그대로 둔다', async () => {
    // given
    const { result } = await renderEntered();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.list.status).toBe('ready'));
    authRequest.mockImplementation((path: string, options?: { method?: string }) =>
      path === '/api/notifications/read-all'
        ? Promise.reject(new ApiError(500, undefined, '서버 오류'))
        : serve(path, options),
    );

    // when
    await act(() => result.current.markAllRead());

    // then
    expect(result.current.actionError).toBe('모두 읽음으로 바꾸지 못했어요. 다시 시도해 주세요');
    expect(result.current.unreadCount).toBe(1);
  });

  it('한 건 읽음은 응답을 기다리지 않고 화면에서 먼저 읽음으로 바꾼다', async () => {
    // given
    const { result } = await renderEntered();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.list.status).toBe('ready'));

    // when
    act(() => result.current.markRead(PAGE.items[0]));

    // then
    expect(authRequest).toHaveBeenCalledWith('/api/notifications/2/read', { method: 'PATCH' });
    expect(result.current.unreadCount).toBe(0);
    const { list } = result.current;
    expect(list.status === 'ready' && list.items[0].read).toBe(true);
  });

  it('읽으려던 알림이 이미 없으면 목록을 다시 받는다', async () => {
    // given
    const { result } = await renderEntered();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.list.status).toBe('ready'));
    authRequest.mockImplementation((path: string, options?: { method?: string }) =>
      path === '/api/notifications/2/read'
        ? Promise.reject(new ApiError(404, 'NOTIFICATION_NOT_FOUND', '알림을 찾을 수 없습니다.'))
        : serve(path, options),
    );
    page = { items: [notification(1, '이전 알림', true)], nextCursor: null };

    // when
    act(() => result.current.markRead(PAGE.items[0]));

    // then
    await waitFor(() => {
      const { list } = result.current;
      expect(list.status === 'ready' && list.items.map((item) => item.id)).toEqual([1]);
    });
  });

  it('더 보기는 다음 페이지를 이어 붙이고 이미 있는 알림은 뺀다', async () => {
    // given
    page = { items: [notification(3, '셋째'), notification(2, '둘째')], nextCursor: 2 };
    const { result } = await renderEntered();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.list.status).toBe('ready'));
    page = { items: [notification(2, '둘째'), notification(1, '첫째')], nextCursor: null };

    // when
    await act(() => result.current.loadMore());

    // then
    expect(authRequest).toHaveBeenCalledWith('/api/notifications?cursor=2');
    const { list } = result.current;
    expect(list.status === 'ready' && list.items.map((item) => item.id)).toEqual([3, 2, 1]);
    expect(list.status === 'ready' && list.nextCursor).toBeNull();
  });
});
