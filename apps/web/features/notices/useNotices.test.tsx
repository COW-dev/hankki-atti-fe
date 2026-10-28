import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NoticePage, NoticeSummary } from '@/features/notices/types';
import { useNotices } from '@/features/notices/useNotices';
import { ApiError } from '@/lib/api/client';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest }),
}));

function notice(noticeId: number, pinned = false): NoticeSummary {
  return { noticeId, title: `공지 ${noticeId}`, pinned, publishedAt: '2026-10-01T09:00:00' };
}

function page(index: number, ids: number[], totalPages: number): NoticePage {
  return {
    notices: ids.map((id) => notice(id)),
    page: index,
    size: 20,
    totalCount: ids.length,
    totalPages,
  };
}

async function renderReady(first: NoticePage) {
  authRequest.mockResolvedValueOnce(first);
  const hook = renderHook(() => useNotices());
  await waitFor(() => expect(hook.result.current.list.status).toBe('ready'));
  return hook;
}

describe('useNotices', () => {
  beforeEach(() => {
    authRequest.mockReset();
  });

  it('첫 페이지를 받고, 페이지가 하나뿐이면 더 보기가 없다', async () => {
    const { result } = await renderReady(page(0, [3, 2, 1], 1));

    expect(authRequest).toHaveBeenCalledWith('/api/notices?page=0');
    expect(result.current.hasMore).toBe(false);
  });

  it('더 보기는 다음 페이지를 이어 붙이고 이미 있는 공지는 뺀 뒤 새로 붙은 첫 공지를 알린다', async () => {
    // given
    const { result } = await renderReady(page(0, [5, 4], 2));
    authRequest.mockResolvedValueOnce(page(1, [4, 3, 2], 2));

    // when
    await act(() => result.current.loadMore());

    // then
    expect(authRequest).toHaveBeenLastCalledWith('/api/notices?page=1');
    const { list } = result.current;
    expect(list.status === 'ready' && list.notices.map((each) => each.noticeId)).toEqual([
      5, 4, 3, 2,
    ]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loadedMore).toEqual({ firstId: 3, count: 2, key: 1 });
  });

  it('더 보기가 실패하면 목록은 그대로 두고 다시 누를 수 있게 오류를 보인다', async () => {
    // given
    const { result } = await renderReady(page(0, [5, 4], 2));
    authRequest.mockRejectedValueOnce(new ApiError(500, undefined, '서버 오류'));

    // when
    await act(() => result.current.loadMore());

    // then
    expect(result.current.moreError).toBe('공지를 더 불러오지 못했어요. 다시 시도해 주세요');
    expect(result.current.hasMore).toBe(true);
    const { list } = result.current;
    expect(list.status === 'ready' && list.notices).toHaveLength(2);
  });

  it('첫 조회가 실패하면 error가 되고 다시 시도하면 다시 받는다', async () => {
    // given
    authRequest.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.list.status).toBe('error'));
    authRequest.mockResolvedValueOnce(page(0, [1], 1));

    // when
    await act(() => result.current.reload());

    // then
    expect(result.current.list.status).toBe('ready');
  });
});
