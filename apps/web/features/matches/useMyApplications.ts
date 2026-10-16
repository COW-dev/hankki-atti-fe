'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  acceptPromotion,
  cancelApplication,
  declinePromotion,
  fetchMyApplications,
  leaveApplication,
} from './api';
import { applicationErrorMessage } from './application-error';
import { DEFAULT_APPLICATION_FILTER } from './application-filter';
import { applyApplicationUpdate } from './application-update';
import type {
  ApplicationFilter,
  CancelApplicationBody,
  MyApplication,
  MyApplications,
} from './types';

type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: MyApplications };

// 열려 있는 모달과 그 대상. null이면 닫힘
export type ApplicationAction = 'cancel' | 'leave' | 'promotion';
export type ActionTarget = { action: ApplicationAction; application: MyApplication };

// 응답·실패를 화면 상태로 바꾼다. setState는 then 콜백에서만 부른다 (effect 안 동기 setState 금지)
function settle(promise: Promise<MyApplications>): Promise<ListState> {
  return promise.then(
    (data): ListState => ({ status: 'ready', data }),
    (error: unknown): ListState => ({
      status: 'error',
      message: error instanceof Error ? error.message : '매칭 현황을 불러오지 못했어요',
    }),
  );
}

/**
 * F-07 매칭 현황 상태 + 취소·예비 빠지기·승격 응답 흐름.
 * 목록은 ALL로 한 번 받고 필터는 화면에서 거른다. 동작 응답(카드 모양)은 replace로 한 건만 바꾼다.
 * 화면에 처음 들어왔을 때 승격 응답 대기 건이 있으면 가장 가까운 건의 승격 모달을 한 번 연다 (plan 확인 필요 2).
 */
export function useMyApplications(enabled: boolean) {
  const { authRequest } = useAuth();
  const [list, setList] = useState<ListState>({ status: 'loading' });
  const [filter, setFilter] = useState<ApplicationFilter>(DEFAULT_APPLICATION_FILTER);
  const [target, setTarget] = useState<ActionTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 모달 안 오류 (다시 누를 수 있는 오류)
  const [actionError, setActionError] = useState<string | null>(null);
  // 목록 블록 오류 (서버 상태가 바뀌어 목록을 다시 받은 경우)
  const [listError, setListError] = useState<string | null>(null);
  // 완료 안내 (polite)
  const [notice, setNotice] = useState<string | null>(null);
  // 카드가 바뀌거나 사라진 뒤 포커스를 "진행 중" 제목으로 보내라는 신호. 값이 바뀔 때마다
  const [refreshKey, setRefreshKey] = useState(0);
  const autoOpened = useRef(false);

  const load = useCallback(
    () => settle(fetchMyApplications(authRequest)).then(setList),
    [authRequest],
  );
  const refresh = useCallback(() => load().then(() => setRefreshKey((key) => key + 1)), [load]);

  useEffect(() => {
    if (!enabled) return;
    void settle(fetchMyApplications(authRequest)).then((state) => {
      setList(state);
      if (state.status !== 'ready' || autoOpened.current) return;
      autoOpened.current = true;
      // 진행 중은 식사 가까운 순이라 첫 승격 응답 대기 건이 가장 급하다
      const pending = state.data.inProgress.find((app) => app.status === 'PROMOTION_PENDING');
      if (pending) setTarget({ action: 'promotion', application: pending });
    });
  }, [enabled, authRequest]);

  // 다시 시도: 로딩으로 바꾸고 다시 받는다
  const reload = useCallback(() => {
    setList({ status: 'loading' });
    setListError(null);
    return load();
  }, [load]);

  const replace = useCallback((updated: MyApplication) => {
    setList((current) =>
      current.status === 'ready'
        ? { status: 'ready', data: applyApplicationUpdate(current.data, updated) }
        : current,
    );
  }, []);

  const open = useCallback((action: ApplicationAction, application: MyApplication) => {
    setActionError(null);
    setListError(null);
    setNotice(null);
    setTarget({ action, application });
  }, []);

  const close = useCallback(() => {
    if (submitting) return;
    setTarget(null);
  }, [submitting]);

  // 동작 공통: 성공하면 카드를 바꾸고 모달을 닫고 안내 + 포커스 신호. 상태가 바뀐 오류면 모달을 닫고 재조회
  const run = useCallback(
    async (request: () => Promise<MyApplication>, doneNotice: string) => {
      if (!target || submitting) return;
      setSubmitting(true);
      setActionError(null);
      try {
        const updated = await request();
        replace(updated);
        setTarget(null);
        setNotice(doneNotice);
        setRefreshKey((key) => key + 1);
      } catch (caught) {
        const { message, reload: shouldReload } = applicationErrorMessage(caught);
        if (shouldReload) {
          setTarget(null);
          setListError(message);
          void refresh();
        } else {
          setActionError(message);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [target, submitting, replace, refresh],
  );

  const submitCancel = useCallback(
    (body: CancelApplicationBody) =>
      target
        ? run(
            () => cancelApplication(authRequest, target.application.applicationId, body),
            '매칭을 취소했어요',
          )
        : Promise.resolve(),
    [run, target, authRequest],
  );
  const submitLeave = useCallback(
    () =>
      target
        ? run(
            () => leaveApplication(authRequest, target.application.applicationId),
            '예비에서 빠졌어요',
          )
        : Promise.resolve(),
    [run, target, authRequest],
  );
  const submitAccept = useCallback(
    () =>
      target
        ? run(() => acceptPromotion(authRequest, target.application.applicationId), '매칭됐어요')
        : Promise.resolve(),
    [run, target, authRequest],
  );
  const submitDecline = useCallback(
    () =>
      target
        ? run(
            () => declinePromotion(authRequest, target.application.applicationId),
            '승격을 거절했어요',
          )
        : Promise.resolve(),
    [run, target, authRequest],
  );

  return {
    list,
    filter,
    setFilter,
    reload,
    target,
    open,
    close,
    submitting,
    actionError,
    listError,
    notice,
    refreshKey,
    submitCancel,
    submitLeave,
    submitAccept,
    submitDecline,
  };
}
