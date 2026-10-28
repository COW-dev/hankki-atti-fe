'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { fetchNotice } from './api';
import { noticeLoadFailure, type NoticeLoadFailure } from './notice-error';
import type { NoticeDetail } from './types';

export type NoticeState =
  { status: 'loading' } | { status: 'ready'; notice: NoticeDetail } | { status: NoticeLoadFailure };

function settle(promise: Promise<NoticeDetail>): Promise<NoticeState> {
  return promise.then(
    (notice): NoticeState => ({ status: 'ready', notice }),
    (error: unknown): NoticeState => ({ status: noticeLoadFailure(error) }),
  );
}

// 주소의 공지 ID. 양의 정수가 아니면 요청하지 않고 없는 공지로 본다
export function parseNoticeId(value: string): number | null {
  return /^[1-9]\d*$/.test(value) ? Number(value) : null;
}

/** F-03 공지 상세 (U-25). 삭제된 공지·없는 공지는 서버 오류 코드로 가른다. */
export function useNotice(id: number | null) {
  const { authRequest } = useAuth();
  const [state, setState] = useState<NoticeState>({ status: 'loading' });

  useEffect(() => {
    if (id === null) return;
    void settle(fetchNotice(authRequest, id)).then(setState);
  }, [authRequest, id]);

  const reload = useCallback(() => {
    if (id === null) return Promise.resolve();
    setState({ status: 'loading' });
    return settle(fetchNotice(authRequest, id)).then(setState);
  }, [authRequest, id]);

  return { state: id === null ? ({ status: 'notFound' } as const) : state, reload };
}
