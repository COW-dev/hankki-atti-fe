import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOpenRequests } from '@/features/requests/open/useOpenRequests';
import type { OpenHelpRequest, OpenHelpRequestDate } from '@/features/requests/types';
import { ApiError } from '@/lib/api/client';
import { parseLocalDateTime } from '@/lib/format/datetime';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest }),
}));

const NOW = parseLocalDateTime('2026-10-16T09:00:00');
const REQUEST: OpenHelpRequest = {
  id: 7,
  startAt: '2026-10-16T12:00:00',
  endAt: '2026-10-16T13:00:00',
  helpTypes: ['SERVING'],
  applyOutcome: 'MATCH',
  blockReason: null,
};
const DATES: OpenHelpRequestDate[] = [{ date: '2026-10-16', requests: [REQUEST] }];

async function renderReady() {
  authRequest.mockResolvedValueOnce(DATES);
  const hook = renderHook(() => useOpenRequests(true, NOW));
  await waitFor(() => expect(hook.result.current.list.status).toBe('ready'));
  return hook;
}

describe('useOpenRequests', () => {
  beforeEach(() => {
    authRequest.mockReset();
  });

  it('오늘부터 7일 뒤까지 목록을 받아 ready가 된다', async () => {
    const { result } = await renderReady();

    expect(authRequest).toHaveBeenCalledWith(
      '/api/help-requests/open?from=2026-10-16&to=2026-10-23',
    );
    expect(result.current.list).toEqual({ status: 'ready', dates: DATES });
    expect(result.current.filter).toBe('today');
  });

  it('지원에 성공하면 확인 모달을 닫고 결과를 담고, 결과를 닫으면 목록을 다시 받는다', async () => {
    const { result } = await renderReady();
    const application = { applicationId: 1, helpRequestId: 7, status: 'MATCHED' as const };
    authRequest.mockResolvedValueOnce(application).mockResolvedValueOnce([]);

    // when 지원 확인 → 지원하기
    act(() => result.current.openApply(REQUEST));
    expect(result.current.applyTarget).toBe(REQUEST);
    await act(() => result.current.submitApply());

    // then
    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/help-requests/7/applications', {
      method: 'POST',
    });
    expect(result.current.applyTarget).toBeNull();
    expect(result.current.result).toEqual(application);

    await act(() => result.current.closeResult());
    expect(result.current.result).toBeNull();
    expect(authRequest).toHaveBeenCalledTimes(3);
    expect(result.current.list).toEqual({ status: 'ready', dates: [] });
    // 다시 받은 뒤 포커스를 옮기라는 신호
    expect(result.current.refreshKey).toBe(1);
  });

  it('409면 모달을 닫고 목록 블록에 사유를 보여 주며 목록을 다시 받는다', async () => {
    const { result } = await renderReady();
    authRequest
      .mockRejectedValueOnce(new ApiError(409, 'APPLICATION_WAITING_FULL', '예비가 다 찼음'))
      .mockResolvedValueOnce([]);

    act(() => result.current.openApply(REQUEST));
    await act(() => result.current.submitApply());

    expect(result.current.applyTarget).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.listError).toBe('예비 인원이 다 찼어요. 목록을 다시 불러올게요');
    await waitFor(() => expect(result.current.list).toEqual({ status: 'ready', dates: [] }));
    await waitFor(() => expect(result.current.refreshKey).toBe(1));
  });

  it('네트워크 오류면 모달을 열어 둔 채 오류를 보여 줘 다시 누를 수 있다', async () => {
    const { result } = await renderReady();
    authRequest.mockRejectedValueOnce(new ApiError(0, undefined, '서버에 연결하지 못했어요'));

    act(() => result.current.openApply(REQUEST));
    await act(() => result.current.submitApply());

    expect(result.current.applyTarget).toBe(REQUEST);
    expect(result.current.applyError).toBe('서버에 연결하지 못했어요');
    expect(result.current.submitting).toBe(false);
    expect(authRequest).toHaveBeenCalledTimes(2);
  });

  it('목록 조회에 실패하면 error 상태가 되고 다시 시도하면 다시 받는다', async () => {
    authRequest
      .mockRejectedValueOnce(new ApiError(500, undefined, '서버 오류'))
      .mockResolvedValueOnce(DATES);
    const { result } = renderHook(() => useOpenRequests(true, NOW));
    await waitFor(() => expect(result.current.list.status).toBe('error'));

    await act(() => result.current.reload());

    expect(result.current.list).toEqual({ status: 'ready', dates: DATES });
  });
});
