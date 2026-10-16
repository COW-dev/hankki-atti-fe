'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { applyToRequest, fetchOpenRequests } from '../api';
import type { HelpRequestApplication, OpenHelpRequest, OpenHelpRequestDate } from '../types';
import { applyErrorMessage } from './apply-error';
import { DEFAULT_DATE_FILTER, openRange, type DateFilter } from './date-filter';

type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; dates: OpenHelpRequestDate[] };

// 응답·실패를 화면 상태로 바꾼다. setState는 then 콜백에서만 부른다 (effect 안 동기 setState 금지)
function settle(promise: Promise<OpenHelpRequestDate[]>): Promise<ListState> {
  return promise.then(
    (dates): ListState => ({ status: 'ready', dates }),
    (error: unknown): ListState => ({
      status: 'error',
      message: error instanceof Error ? error.message : '요청 목록을 불러오지 못했어요',
    }),
  );
}

/**
 * F-06 요청 목록 상태 + 지원 흐름. 목록은 오늘부터 7일 뒤까지 한 번 받고 날짜 필터는 화면에서 거른다.
 * 지원 뒤에는 결과 예고(applyOutcome)가 바뀌므로 결과 모달을 닫을 때 다시 받는다.
 */
export function useOpenRequests(enabled: boolean, now: Date) {
  const { authRequest } = useAuth();
  // 조회 범위는 처음 들어온 시각 기준으로 고정한다 (자정을 넘겨도 목록이 흔들리지 않게)
  const [range] = useState(() => openRange(now));
  const [list, setList] = useState<ListState>({ status: 'loading' });
  const [filter, setFilter] = useState<DateFilter>(DEFAULT_DATE_FILTER);
  // 지원 확인 모달의 대상. null이면 닫힘
  const [applyTarget, setApplyTarget] = useState<OpenHelpRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 모달 안 오류 (다시 누를 수 있는 오류)
  const [applyError, setApplyError] = useState<string | null>(null);
  // 목록 블록 오류 (서버 상태가 바뀌어 목록을 다시 받은 경우)
  const [listError, setListError] = useState<string | null>(null);
  const [result, setResult] = useState<HelpRequestApplication | null>(null);
  // 지원 뒤 목록을 다시 받을 때마다 올라간다 — 화면이 포커스를 목록 제목으로 보내는 신호
  // (눌렀던 버튼이 "지원 불가"로 바뀌어 사라질 수 있어서)
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(
    () => settle(fetchOpenRequests(authRequest, range.from, range.to)).then(setList),
    [authRequest, range],
  );
  const refresh = useCallback(() => load().then(() => setRefreshKey((key) => key + 1)), [load]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  // 다시 시도: 로딩으로 바꾸고 다시 받는다
  const reload = useCallback(() => {
    setList({ status: 'loading' });
    setListError(null);
    return load();
  }, [load]);

  const openApply = useCallback((request: OpenHelpRequest) => {
    setApplyError(null);
    setListError(null);
    setApplyTarget(request);
  }, []);

  const closeApply = useCallback(() => {
    if (submitting) return;
    setApplyTarget(null);
  }, [submitting]);

  const submitApply = useCallback(async () => {
    if (!applyTarget || submitting) return;
    setSubmitting(true);
    setApplyError(null);
    try {
      const application = await applyToRequest(authRequest, applyTarget.id);
      setApplyTarget(null);
      setResult(application);
    } catch (caught) {
      const { message, reload: shouldReload } = applyErrorMessage(caught);
      if (shouldReload) {
        setApplyTarget(null);
        setListError(message);
        void refresh();
      } else {
        setApplyError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [applyTarget, submitting, authRequest, refresh]);

  // 결과 모달을 닫으면 목록을 다시 받는다 — 지원한 카드가 "지원 불가 · 이미 지원한 요청이에요"로 바뀐다
  const closeResult = useCallback(() => {
    setResult(null);
    return refresh();
  }, [refresh]);

  return {
    list,
    range,
    filter,
    setFilter,
    reload,
    applyTarget,
    submitting,
    applyError,
    listError,
    result,
    refreshKey,
    openApply,
    closeApply,
    submitApply,
    closeResult,
  };
}
