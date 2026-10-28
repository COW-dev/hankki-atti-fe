import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseNoticeId, useNotice } from '@/features/notices/useNotice';
import { ApiError } from '@/lib/api/client';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest }),
}));

describe('parseNoticeId', () => {
  it('양의 정수만 공지 ID로 읽는다', () => {
    expect(parseNoticeId('31')).toBe(31);
    expect(parseNoticeId('0')).toBeNull();
    expect(parseNoticeId('3a')).toBeNull();
    expect(parseNoticeId('-1')).toBeNull();
  });
});

describe('useNotice', () => {
  beforeEach(() => {
    authRequest.mockReset();
  });

  it('삭제된 공지면 deleted가 된다', async () => {
    authRequest.mockRejectedValueOnce(new ApiError(404, 'NOTICE_DELETED', '삭제된 공지입니다.'));

    const { result } = renderHook(() => useNotice(31));

    expect(authRequest).toHaveBeenCalledWith('/api/notices/31');
    await waitFor(() => expect(result.current.state.status).toBe('deleted'));
  });

  it('주소의 ID가 올바르지 않으면 요청하지 않고 notFound다', () => {
    const { result } = renderHook(() => useNotice(null));

    expect(authRequest).not.toHaveBeenCalled();
    expect(result.current.state.status).toBe('notFound');
  });
});
