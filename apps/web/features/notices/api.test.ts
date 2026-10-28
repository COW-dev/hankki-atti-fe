import { describe, expect, it, vi } from 'vitest';
import { fetchNotice, fetchNotices } from '@/features/notices/api';

describe('notices api', () => {
  it('목록은 page 쿼리로, 상세는 공지 ID 경로로 받는다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await fetchNotices(authRequest, 2);
    await fetchNotice(authRequest, 31);

    expect(authRequest).toHaveBeenNthCalledWith(1, '/api/notices?page=2');
    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/notices/31');
  });
});
