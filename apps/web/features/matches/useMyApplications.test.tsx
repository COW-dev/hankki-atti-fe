import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MyApplication, MyApplications } from '@/features/matches/types';
import { useMyApplications } from '@/features/matches/useMyApplications';
import { ApiError } from '@/lib/api/client';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest }),
}));

function application(
  applicationId: number,
  status: MyApplication['status'],
  extra: Partial<MyApplication> = {},
): MyApplication {
  return {
    applicationId,
    helpRequestId: applicationId * 10,
    status,
    startAt: '2026-10-17T12:00:00',
    endAt: '2026-10-17T13:00:00',
    helpTypes: ['SERVING'],
    ...extra,
  };
}

const MATCHED = application(1, 'MATCHED', { student: { name: '박서연', kakaoId: 'seoyeon_p' } });
const WAITING = application(2, 'WAITING', { waitingOrder: 2 });
const DATA: MyApplications = { inProgress: [MATCHED, WAITING], past: [] };

async function renderReady(data: MyApplications = DATA) {
  authRequest.mockResolvedValueOnce(data);
  const hook = renderHook(() => useMyApplications(true));
  await waitFor(() => expect(hook.result.current.list.status).toBe('ready'));
  return hook;
}

describe('useMyApplications', () => {
  beforeEach(() => {
    authRequest.mockReset();
  });

  it('매칭 현황을 전체로 한 번 받아 ready가 되고 기본 필터는 전체다', async () => {
    const { result } = await renderReady();

    expect(authRequest).toHaveBeenCalledWith('/api/applications/me');
    expect(result.current.list).toEqual({ status: 'ready', data: DATA });
    expect(result.current.filter).toBe('ALL');
    expect(result.current.target).toBeNull();
  });

  it('승격 응답 대기 건이 있으면 처음 들어왔을 때 그 건의 승격 모달을 연다', async () => {
    const pending = application(3, 'PROMOTION_PENDING', {
      promotionDeadline: '2026-10-17T11:45:00',
    });
    const { result } = await renderReady({ inProgress: [pending, WAITING], past: [] });

    expect(result.current.target).toEqual({ action: 'promotion', application: pending });
  });

  it('취소에 성공하면 모달을 닫고 카드를 지난 활동으로 옮기며 안내와 포커스 신호를 낸다', async () => {
    const { result } = await renderReady();
    const canceled = application(1, 'HELPER_CANCELED', { cancelReason: 'ILLNESS' });
    authRequest.mockResolvedValueOnce(canceled);

    act(() => result.current.open('cancel', MATCHED));
    expect(result.current.target).toEqual({ action: 'cancel', application: MATCHED });
    await act(() => result.current.submitCancel({ reason: 'ILLNESS' }));

    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/applications/1/cancel', {
      method: 'POST',
      body: { reason: 'ILLNESS' },
    });
    expect(result.current.target).toBeNull();
    expect(result.current.notice).toBe('매칭을 취소했어요');
    expect(result.current.refreshKey).toBe(1);
    expect(result.current.list).toEqual({
      status: 'ready',
      data: { inProgress: [WAITING], past: [canceled] },
    });
    // 다시 조회하지 않는다
    expect(authRequest).toHaveBeenCalledTimes(2);
  });

  it('승격을 수락하면 같은 자리의 카드가 매칭 완료로 바뀐다', async () => {
    const pending = application(3, 'PROMOTION_PENDING');
    const { result } = await renderReady({ inProgress: [pending], past: [] });
    const matched = application(3, 'MATCHED', { student: { name: '김하늘', kakaoId: 'sky' } });
    authRequest.mockResolvedValueOnce(matched);

    await act(() => result.current.submitAccept());

    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/applications/3/promotion/accept', {
      method: 'POST',
    });
    expect(result.current.notice).toBe('매칭됐어요');
    expect(result.current.list).toEqual({
      status: 'ready',
      data: { inProgress: [matched], past: [] },
    });
  });

  it('409면 모달을 닫고 목록 블록에 사유를 보여 주며 목록을 다시 받는다', async () => {
    const { result } = await renderReady();
    authRequest
      .mockRejectedValueOnce(new ApiError(409, 'APPLICATION_INVALID_STATUS', '상태'))
      .mockResolvedValueOnce({ inProgress: [], past: [] });

    act(() => result.current.open('leave', WAITING));
    await act(() => result.current.submitLeave());

    expect(result.current.target).toBeNull();
    expect(result.current.listError).toBe('이미 상태가 바뀐 건이에요. 목록을 다시 불러올게요');
    await waitFor(() =>
      expect(result.current.list).toEqual({
        status: 'ready',
        data: { inProgress: [], past: [] },
      }),
    );
    await waitFor(() => expect(result.current.refreshKey).toBe(1));
  });

  it('422나 네트워크 오류면 모달을 열어 둔 채 오류를 보여 줘 다시 누를 수 있다', async () => {
    const { result } = await renderReady();
    authRequest.mockRejectedValueOnce(
      new ApiError(422, 'APPLICATION_CANCEL_REASON_DETAIL_REQUIRED', '내용 없음'),
    );

    act(() => result.current.open('cancel', MATCHED));
    await act(() => result.current.submitCancel({ reason: 'OTHER' }));

    expect(result.current.target).toEqual({ action: 'cancel', application: MATCHED });
    expect(result.current.actionError).toBe('기타 사유를 적어 주세요');
    expect(result.current.submitting).toBe(false);
    expect(authRequest).toHaveBeenCalledTimes(2);
  });

  it('목록 조회에 실패하면 error 상태가 되고 다시 시도하면 다시 받는다', async () => {
    authRequest
      .mockRejectedValueOnce(new ApiError(500, undefined, '서버 오류'))
      .mockResolvedValueOnce(DATA);
    const { result } = renderHook(() => useMyApplications(true));
    await waitFor(() => expect(result.current.list.status).toBe('error'));

    await act(() => result.current.reload());

    expect(result.current.list).toEqual({ status: 'ready', data: DATA });
  });
});
