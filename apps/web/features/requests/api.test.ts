import { describe, expect, it, vi } from 'vitest';
import {
  applyToRequest,
  cancelRequest,
  createRequest,
  fetchMyRequests,
  fetchOpenRequests,
  fetchTimeOptions,
  reportNoShow,
  withdrawRequest,
} from '@/features/requests/api';

describe('requests api', () => {
  it('내 신청은 GET /api/help-requests/me', async () => {
    const authRequest = vi.fn().mockResolvedValue({ upcoming: [], past: [] });

    const result = await fetchMyRequests(authRequest);

    expect(authRequest).toHaveBeenCalledWith('/api/help-requests/me');
    expect(result).toEqual({ upcoming: [], past: [] });
  });

  it('철회·노쇼 신고·매칭 취소는 신청 ID 경로에 본문 없이 POST하고 바뀐 신청을 돌려준다', async () => {
    const authRequest = vi.fn().mockResolvedValue({ id: 7, status: 'CANCELED' });

    await withdrawRequest(authRequest, 7);
    await reportNoShow(authRequest, 8);
    const canceled = await cancelRequest(authRequest, 9);

    expect(authRequest).toHaveBeenNthCalledWith(1, '/api/help-requests/7/withdraw', {
      method: 'POST',
    });
    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/help-requests/8/no-show', {
      method: 'POST',
    });
    expect(authRequest).toHaveBeenNthCalledWith(3, '/api/help-requests/9/cancel', {
      method: 'POST',
    });
    expect(canceled.status).toBe('CANCELED');
  });

  it('시작 시각 선택지는 GET /api/help-requests/time-options', async () => {
    const authRequest = vi.fn().mockResolvedValue([]);

    await fetchTimeOptions(authRequest);

    expect(authRequest).toHaveBeenCalledWith('/api/help-requests/time-options');
  });

  it('신청은 POST /api/help-requests에 본문을 보내고 만들어진 신청을 돌려준다', async () => {
    const authRequest = vi.fn().mockResolvedValue({ id: 9, status: 'RECRUITING' });
    const body = { startAt: '2026-10-12T12:00:00', helpTypes: ['SERVING' as const] };

    const result = await createRequest(authRequest, body);

    expect(authRequest).toHaveBeenCalledWith('/api/help-requests', { method: 'POST', body });
    expect(result.status).toBe('RECRUITING');
  });

  it('모집 중 신청은 GET /api/help-requests/open에 from·to 날짜를 붙인다', async () => {
    const authRequest = vi.fn().mockResolvedValue([]);

    await fetchOpenRequests(authRequest, '2026-10-16', '2026-10-23');

    expect(authRequest).toHaveBeenCalledWith(
      '/api/help-requests/open?from=2026-10-16&to=2026-10-23',
    );
  });

  it('지원은 신청 ID 경로의 applications에 본문 없이 POST하고 지원 결과를 돌려준다', async () => {
    const authRequest = vi.fn().mockResolvedValue({ applicationId: 1, status: 'WAITING' });

    const result = await applyToRequest(authRequest, 7);

    expect(authRequest).toHaveBeenCalledWith('/api/help-requests/7/applications', {
      method: 'POST',
    });
    expect(result.status).toBe('WAITING');
  });
});
