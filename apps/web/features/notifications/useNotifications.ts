'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './api';
import { newNotificationAnnouncement } from './new-notification';
import type { AppNotification } from './types';

// 안 읽은 개수를 다시 받는 간격 (명세 §2.3 "주기적으로 다시 조회")
export const UNREAD_POLL_INTERVAL_MS = 30_000;

export type NotificationListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: AppNotification[]; nextCursor: number | null };

// polite 영역 문장. 같은 문장이 또 와도 다시 읽도록 id를 바꾼다
export type Announcement = { id: number; text: string };

type CountResult = { version: number; previous: number | null; count: number; text: string | null };

/**
 * 상단 바 알림 (U-08·U-09): 안 읽은 개수는 화면에 들어올 때와 30초마다(탭이 보일 때만) 받고,
 * 목록은 패널을 열 때 받는다. 새 알림·모두 읽음은 polite 영역 한 곳으로 알린다.
 */
export function useNotifications(enabled: boolean) {
  const { authRequest } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<NotificationListState>({ status: 'loading' });
  // 상대 시각("10분 전")의 기준. 목록을 받을 때마다 맞춘다
  const [listedAt, setListedAt] = useState(() => new Date());
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  // 패널 안 오류 (모두 읽음·더 보기 실패)
  const [actionError, setActionError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  // 직전에 받은 개수. 늘었을 때만 새 알림으로 읽는다
  const lastCount = useRef<number | null>(null);
  // 읽음 처리로 개수를 화면에서 바꿀 때마다 올린다. 그 전에 출발한 주기 조회 결과는 버린다
  const countVersion = useRef(0);

  const announce = useCallback((text: string) => {
    setAnnouncement((current) => ({ id: (current?.id ?? 0) + 1, text }));
  }, []);

  const setCountLocally = useCallback((update: (count: number) => number) => {
    countVersion.current += 1;
    lastCount.current = lastCount.current === null ? null : update(lastCount.current);
    setUnreadCount((count) => (count === null ? count : update(count)));
  }, []);

  // 개수를 받아 온다. 화면 상태는 applyCount가 바꾼다 (effect 안에서는 then 콜백에서만 setState)
  const pollCount = useCallback(async (): Promise<CountResult | null> => {
    const version = countVersion.current;
    const previous = lastCount.current;
    try {
      const { count } = await fetchUnreadCount(authRequest);
      if (previous === null || count <= previous) return { version, previous, count, text: null };
      const page = await fetchNotifications(authRequest);
      return {
        version,
        previous,
        count,
        text: newNotificationAnnouncement(previous, count, page.items),
      };
    } catch {
      // 주기 조회 실패는 다음 주기에 다시 받는다. 로그인이 풀렸으면 화면 가드가 처리한다
      return null;
    }
  }, [authRequest]);

  const applyCount = useCallback(
    (result: CountResult | null) => {
      // 그사이 읽음 처리로 개수를 바꿨으면 출발 전 값이라 버린다
      if (!result || result.version !== countVersion.current) return;
      // 겹쳐 간 다른 조회가 먼저 반영했으면 같은 새 알림을 두 번 읽지 않는다
      const fresh = lastCount.current === result.previous;
      lastCount.current = result.count;
      setUnreadCount(result.count);
      if (fresh && result.text) announce(result.text);
    },
    [announce],
  );

  useEffect(() => {
    if (!enabled) return;
    const check = () => void pollCount().then(applyCount);
    check();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, UNREAD_POLL_INTERVAL_MS);
    // 다른 탭·앱에서 돌아오면 바로 받는다
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, pollCount, applyCount]);

  const loadList = useCallback(() => {
    setList({ status: 'loading' });
    setActionError(null);
    return fetchNotifications(authRequest).then(
      (page) => {
        setListedAt(new Date());
        setList({ status: 'ready', items: page.items, nextCursor: page.nextCursor });
      },
      () => setList({ status: 'error' }),
    );
  }, [authRequest]);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    void loadList();
  }, [open, loadList]);

  const close = useCallback(() => setOpen(false), []);

  const loadMore = useCallback(async () => {
    if (list.status !== 'ready' || list.nextCursor === null || loadingMore) return;
    setLoadingMore(true);
    setActionError(null);
    try {
      const page = await fetchNotifications(authRequest, list.nextCursor);
      setList((current) => {
        if (current.status !== 'ready') return current;
        // 그사이 새 알림이 와서 페이지 경계가 밀려도 같은 알림이 두 번 보이지 않게 한다
        const seen = new Set(current.items.map((item) => item.id));
        return {
          status: 'ready',
          items: [...current.items, ...page.items.filter((item) => !seen.has(item.id))],
          nextCursor: page.nextCursor,
        };
      });
    } catch {
      setActionError('이전 알림을 불러오지 못했어요. 다시 시도해 주세요');
    } finally {
      setLoadingMore(false);
    }
  }, [authRequest, list, loadingMore]);

  // 알림 한 건 읽음. 이동은 기다리지 않는다 — 읽음 처리가 실패해도 알림 내용은 볼 수 있어야 한다
  const markRead = useCallback(
    (item: AppNotification) => {
      if (item.read) return;
      setCountLocally((count) => Math.max(0, count - 1));
      setList((current) =>
        current.status === 'ready'
          ? {
              ...current,
              items: current.items.map((each) =>
                each.id === item.id ? { ...each, read: true } : each,
              ),
            }
          : current,
      );
      markNotificationRead(authRequest, item.id).catch((error: unknown) => {
        // 이미 지워진 알림이면 목록을 다시 받는다. 그 밖의 실패는 다음 개수 조회에서 맞춰진다
        if (error instanceof ApiError && error.code === ErrorCode.NOTIFICATION_NOT_FOUND) {
          void loadList();
        }
      });
    },
    [authRequest, setCountLocally, loadList],
  );

  const markAllRead = useCallback(async () => {
    if (markingAll) return;
    setMarkingAll(true);
    setActionError(null);
    try {
      await markAllNotificationsRead(authRequest);
      setCountLocally(() => 0);
      setList((current) =>
        current.status === 'ready'
          ? { ...current, items: current.items.map((item) => ({ ...item, read: true })) }
          : current,
      );
      announce('알림을 모두 읽었어요');
    } catch {
      setActionError('모두 읽음으로 바꾸지 못했어요. 다시 시도해 주세요');
    } finally {
      setMarkingAll(false);
    }
  }, [authRequest, markingAll, setCountLocally, announce]);

  return {
    unreadCount,
    open,
    toggle,
    close,
    list,
    listedAt,
    reload: loadList,
    loadMore,
    loadingMore,
    markRead,
    markAllRead,
    markingAll,
    actionError,
    announcement,
  };
}
