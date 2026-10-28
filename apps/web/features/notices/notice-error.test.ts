import { describe, expect, it } from 'vitest';
import { noticeLoadFailure } from '@/features/notices/notice-error';
import { ApiError } from '@/lib/api/client';

describe('noticeLoadFailure', () => {
  it('삭제된 공지면 deleted, 없거나 대상이 아니면 notFound', () => {
    expect(noticeLoadFailure(new ApiError(404, 'NOTICE_DELETED', '삭제된 공지입니다.'))).toBe(
      'deleted',
    );
    expect(
      noticeLoadFailure(new ApiError(404, 'NOTICE_NOT_FOUND', '공지를 찾을 수 없습니다.')),
    ).toBe('notFound');
  });

  it('그 밖의 서버 오류·네트워크 오류는 다시 시도', () => {
    expect(noticeLoadFailure(new ApiError(500, undefined, '서버 오류'))).toBe('retry');
    expect(noticeLoadFailure(new TypeError('Failed to fetch'))).toBe('retry');
  });
});
