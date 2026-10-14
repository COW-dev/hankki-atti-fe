'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { HelpType } from '@/lib/labels/help-request';
import { createRequest, fetchMyRequests, fetchTimeOptions } from '../api';
import type { CreatedHelpRequest, MyHelpRequest, TimeOptionDate } from '../types';
import {
  canSubmit,
  initialForm,
  toRequestBody,
  withDateChoice,
  withHelpTypeToggled,
  type CreateFormState,
} from './form-state';

type OptionsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  // upcoming: 겹치는 시각을 미리 비활성으로 보여 주려고 내 진행 중 신청도 같이 받는다
  | { status: 'ready'; dates: TimeOptionDate[]; upcoming: MyHelpRequest[] };

function settle(
  promise: Promise<[TimeOptionDate[], { upcoming: MyHelpRequest[] }]>,
): Promise<OptionsState> {
  return promise.then(
    ([dates, mine]): OptionsState => ({ status: 'ready', dates, upcoming: mine.upcoming }),
    (error: unknown): OptionsState => ({
      status: 'error',
      message: error instanceof Error ? error.message : '선택지를 불러오지 못했어요',
    }),
  );
}

/**
 * F-01 도우미 신청 폼 상태. 선택지를 받으면 첫 날짜를 골라 두고, 신청이 되면 created에 담는다.
 */
export function useCreateRequestForm(enabled: boolean) {
  const { authRequest } = useAuth();
  const [options, setOptions] = useState<OptionsState>({ status: 'loading' });
  const [form, setForm] = useState<CreateFormState>(initialForm([]));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherHelpTextError, setOtherHelpTextError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedHelpRequest | null>(null);

  // 선택지를 받으면 폼을 처음 상태로 (setState는 then 콜백에서만)
  const applyOptions = useCallback((next: OptionsState) => {
    setOptions(next);
    if (next.status === 'ready') setForm(initialForm(next.dates));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void settle(Promise.all([fetchTimeOptions(authRequest), fetchMyRequests(authRequest)])).then(
      applyOptions,
    );
  }, [enabled, authRequest, applyOptions]);

  const reloadOptions = useCallback(() => {
    setOptions({ status: 'loading' });
    return settle(Promise.all([fetchTimeOptions(authRequest), fetchMyRequests(authRequest)])).then(
      applyOptions,
    );
  }, [authRequest, applyOptions]);

  const selectDate = useCallback((value: string) => {
    setForm((current) => withDateChoice(current, value));
  }, []);
  const selectTime = useCallback((startAt: string) => {
    setForm((current) => ({ ...current, startAt }));
  }, []);
  const toggleHelpType = useCallback((type: HelpType) => {
    setOtherHelpTextError(null);
    setForm((current) => withHelpTypeToggled(current, type));
  }, []);
  const changeOtherHelpText = useCallback((otherHelpText: string) => {
    setOtherHelpTextError(null);
    setForm((current) => ({ ...current, otherHelpText }));
  }, []);
  const changeMemo = useCallback((memo: string) => {
    setForm((current) => ({ ...current, memo }));
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit(form) || submitting) return;
    setSubmitting(true);
    setError(null);
    setOtherHelpTextError(null);
    try {
      setCreated(await createRequest(authRequest, toRequestBody(form)));
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === ErrorCode.HELP_REQUEST_TIME_OVERLAP) {
        setError('이미 신청한 시간과 겹쳐요. 다른 시각을 골라 주세요');
      } else if (
        caught instanceof ApiError &&
        caught.code === ErrorCode.HELP_REQUEST_START_TIME_NOT_AVAILABLE
      ) {
        // 고르는 사이 시각이 지났다 — 선택지를 다시 받고 시각은 비운다
        setError('지금은 고를 수 없는 시각이에요. 선택지를 다시 불러왔어요');
        void reloadOptions();
      } else if (
        caught instanceof ApiError &&
        caught.code === ErrorCode.HELP_REQUEST_OTHER_HELP_TEXT_REQUIRED
      ) {
        setOtherHelpTextError('기타 도움 내용을 입력해 주세요');
      } else {
        setError(caught instanceof Error ? caught.message : '잠시 후 다시 시도해 주세요');
      }
    } finally {
      setSubmitting(false);
    }
  }, [authRequest, form, submitting, reloadOptions]);

  // "하나 더 신청하기": 방금 신청한 시각이 빠진 선택지를 다시 받는다 (겹침은 서버가 409로 막는다)
  const reset = useCallback(() => {
    setCreated(null);
    setError(null);
    setOtherHelpTextError(null);
    void reloadOptions();
  }, [reloadOptions]);

  return {
    options,
    form,
    submitting,
    error,
    otherHelpTextError,
    created,
    selectDate,
    selectTime,
    toggleHelpType,
    changeOtherHelpText,
    changeMemo,
    submit,
    reset,
    reloadOptions,
  };
}
