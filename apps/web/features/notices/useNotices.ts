'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { fetchNotices } from './api';
import type { NoticePage, NoticeSummary } from './types';

export type NoticeListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; notices: NoticeSummary[]; page: number; totalPages: number };

// 더 보기로 새로 붙은 첫 공지 — 화면이 이 공지로 포커스를 옮기고 개수를 polite로 알린다. 값이 바뀔 때마다
export type LoadedMore = { firstId: number | null; count: number; key: number };

function toReady(page: NoticePage): NoticeListState {
  return {
    status: 'ready',
    notices: page.notices,
    page: page.page,
    totalPages: page.totalPages,
  };
}

// setState는 then 콜백에서만 부른다 (effect 안 동기 setState 금지)
function settle(promise: Promise<NoticePage>): Promise<NoticeListState> {
  return promise.then(toReady, (): NoticeListState => ({ status: 'error' }));
}

/** F-03 공지 목록 (U-24): 첫 페이지를 받고 [더 보기]로 20개씩 이어 붙인다 (무한 스크롤 없음). */
export function useNotices() {
  const { authRequest } = useAuth();
  const [list, setList] = useState<NoticeListState>({ status: 'loading' });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [loadedMore, setLoadedMore] = useState<LoadedMore | null>(null);

  useEffect(() => {
    void settle(fetchNotices(authRequest, 0)).then(setList);
  }, [authRequest]);

  const reload = useCallback(() => {
    setList({ status: 'loading' });
    setMoreError(null);
    return settle(fetchNotices(authRequest, 0)).then(setList);
  }, [authRequest]);

  const hasMore = list.status === 'ready' && list.page + 1 < list.totalPages;

  const loadMore = useCallback(async () => {
    if (list.status !== 'ready' || !hasMore || loadingMore) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const next = await fetchNotices(authRequest, list.page + 1);
      // 그사이 새 공지가 올라와 페이지 경계가 밀려도 같은 공지가 두 번 보이지 않게 한다
      const seen = new Set(list.notices.map((notice) => notice.noticeId));
      const added = next.notices.filter((notice) => !seen.has(notice.noticeId));
      setList({
        status: 'ready',
        notices: [...list.notices, ...added],
        page: next.page,
        totalPages: next.totalPages,
      });
      setLoadedMore((current) => ({
        firstId: added[0]?.noticeId ?? null,
        count: added.length,
        key: (current?.key ?? 0) + 1,
      }));
    } catch {
      setMoreError('공지를 더 불러오지 못했어요. 다시 시도해 주세요');
    } finally {
      setLoadingMore(false);
    }
  }, [authRequest, list, hasMore, loadingMore]);

  return { list, reload, hasMore, loadMore, loadingMore, moreError, loadedMore };
}
