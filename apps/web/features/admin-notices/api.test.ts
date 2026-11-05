import { describe, expect, it, vi } from 'vitest';
import {
  createNotice,
  deleteNotice,
  fetchAdminNotices,
  isNoticeGone,
  noticeDeleteFailureMessage,
  noticeLoadFailureMessage,
  noticeSaveFailureMessage,
  updateNotice,
} from '@/features/admin-notices/api';
import { ApiError } from '@/lib/api/client';

const apiError = (status: number, code: string) => new ApiError(status, code, '서버 문구');
const request = { title: '제목', body: '본문', target: 'ALL', pinned: true } as const;

describe('공지 관리 요청', () => {
  it('목록은 페이지를 넣어 부른다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await fetchAdminNotices(authRequest, 2);

    expect(authRequest).toHaveBeenCalledWith('/api/admin/notices?page=2');
  });

  it('작성은 POST, 수정은 PATCH, 삭제는 DELETE로 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await createNotice(authRequest, request);
    await updateNotice(authRequest, 7, request);
    await deleteNotice(authRequest, 7);

    expect(authRequest).toHaveBeenNthCalledWith(1, '/api/admin/notices', {
      method: 'POST',
      body: request,
    });
    expect(authRequest).toHaveBeenNthCalledWith(2, '/api/admin/notices/7', {
      method: 'PATCH',
      body: request,
    });
    expect(authRequest).toHaveBeenNthCalledWith(3, '/api/admin/notices/7', { method: 'DELETE' });
  });
});

describe('공지 오류 문구', () => {
  it('삭제됐거나 없는 공지는 사라진 공지로 본다', () => {
    expect(isNoticeGone(apiError(404, 'NOTICE_DELETED'))).toBe(true);
    expect(isNoticeGone(apiError(404, 'NOTICE_NOT_FOUND'))).toBe(true);
    expect(isNoticeGone(apiError(500, 'COMMON_INTERNAL_ERROR'))).toBe(false);
    expect(noticeLoadFailureMessage(apiError(404, 'NOTICE_DELETED'))).toBe('삭제된 공지예요');
  });

  it('저장 오류는 code로 나눈다', () => {
    expect(noticeSaveFailureMessage(apiError(409, 'NOTICE_DUPLICATE_SUBMIT'))).toBe(
      '방금 같은 제목으로 게시했어요. 잠시 후 다시 시도해 주세요',
    );
    expect(noticeSaveFailureMessage(apiError(403, 'AUTH_ACCESS_DENIED'))).toBe(
      '전체 권한 관리자만 공지를 저장할 수 있어요',
    );
    expect(noticeSaveFailureMessage(apiError(404, 'NOTICE_DELETED'))).toBe('삭제된 공지예요');
    expect(noticeSaveFailureMessage(apiError(500, 'COMMON_INTERNAL_ERROR'))).toBe(
      '공지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요',
    );
  });

  it('삭제 권한 오류는 전체 권한을 안내한다', () => {
    expect(noticeDeleteFailureMessage(apiError(403, 'AUTH_ACCESS_DENIED'))).toBe(
      '전체 권한 관리자만 공지를 삭제할 수 있어요',
    );
  });
});
