import { describe, expect, it, vi } from 'vitest';
import {
  createRequest,
  fetchMyRequests,
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

  it('철회·노쇼 신고는 신청 ID 경로에 POST하고 바뀐 신청을 돌려준다', async () => {
    const authRequest = vi.fn().mockResolvedValue({ id: 7, status: 'CANCELED' });

    await withdrawRequest(authRequest, 7);
    await reportNoShow(authRequest, 8);

    expect(authRequest).toHaveBeenNthCalledWith(1, '/api/help-requests/7/withdraw', {
      method: 'POST',
    });
    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/help-requests/8/no-show', {
      method: 'POST',
    });
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
});
