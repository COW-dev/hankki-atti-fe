'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { fetchMyRequests } from './api';
import { applyUpdate } from './apply-update';
import type { MyHelpRequest, MyHelpRequests } from './types';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: MyHelpRequests };

// 응답·실패를 화면 상태로 바꾼다. setState는 then 콜백에서만 부른다 (effect 안 동기 setState 금지)
function settle(promise: Promise<MyHelpRequests>): Promise<State> {
  return promise.then(
    (data): State => ({ status: 'ready', data }),
    (error: unknown): State => ({
      status: 'error',
      message: error instanceof Error ? error.message : '신청을 불러오지 못했어요',
    }),
  );
}

/**
 * 내 신청 목록. 철회·신고 응답은 replace로 한 건만 바꿔 다시 조회하지 않는다 (AGENTS.md: 상태 변경 API는 바뀐 리소스를 돌려준다).
 */
export function useMyRequests(enabled: boolean) {
  const { authRequest } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!enabled) return;
    void settle(fetchMyRequests(authRequest)).then(setState);
  }, [enabled, authRequest]);

  // 다시 시도·재조회: 로딩으로 바꾸고 다시 받는다
  const reload = useCallback(() => {
    setState({ status: 'loading' });
    return settle(fetchMyRequests(authRequest)).then(setState);
  }, [authRequest]);

  const replace = useCallback((updated: MyHelpRequest) => {
    setState((current) =>
      current.status === 'ready'
        ? { status: 'ready', data: applyUpdate(current.data, updated) }
        : current,
    );
  }, []);

  return { state, reload, replace };
}
