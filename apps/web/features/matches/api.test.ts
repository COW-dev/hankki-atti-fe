import { describe, expect, it, vi } from 'vitest';
import {
  acceptPromotion,
  cancelApplication,
  declinePromotion,
  fetchMyApplications,
  leaveApplication,
} from '@/features/matches/api';

describe('matches api', () => {
  it('매칭 현황은 GET /api/applications/me (필터 없이 전체)', async () => {
    const authRequest = vi.fn().mockResolvedValue({ inProgress: [], past: [] });

    const result = await fetchMyApplications(authRequest);

    expect(authRequest).toHaveBeenCalledWith('/api/applications/me');
    expect(result).toEqual({ inProgress: [], past: [] });
  });

  it('매칭 취소는 지원 ID 경로 cancel에 사유 본문을 POST한다', async () => {
    const authRequest = vi.fn().mockResolvedValue({ applicationId: 7, status: 'HELPER_CANCELED' });
    const body = { reason: 'OTHER' as const, reasonDetail: '갑자기 시험 일정이 생겼어요' };

    const result = await cancelApplication(authRequest, 7, body);

    expect(authRequest).toHaveBeenCalledWith('/api/applications/7/cancel', {
      method: 'POST',
      body,
    });
    expect(result.status).toBe('HELPER_CANCELED');
  });

  it('예비 빠지기·승격 수락·승격 거절은 본문 없이 POST한다', async () => {
    const authRequest = vi.fn().mockResolvedValue({ applicationId: 8 });

    await leaveApplication(authRequest, 8);
    await acceptPromotion(authRequest, 9);
    await declinePromotion(authRequest, 10);

    expect(authRequest).toHaveBeenNthCalledWith(1, '/api/applications/8/leave', {
      method: 'POST',
    });
    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/applications/9/promotion/accept', {
      method: 'POST',
    });
    expect(authRequest).toHaveBeenNthCalledWith(3, '/api/applications/10/promotion/decline', {
      method: 'POST',
    });
  });
});
