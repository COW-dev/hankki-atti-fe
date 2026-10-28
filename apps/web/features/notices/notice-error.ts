import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';

// 공지 상세를 못 받았을 때 보여 줄 화면: 삭제됨(명세 F-03) · 없음(없거나 내 대상이 아님) · 다시 시도
export type NoticeLoadFailure = 'deleted' | 'notFound' | 'retry';

export function noticeLoadFailure(error: unknown): NoticeLoadFailure {
  if (!(error instanceof ApiError)) return 'retry';
  if (error.code === ErrorCode.NOTICE_DELETED) return 'deleted';
  if (error.code === ErrorCode.NOTICE_NOT_FOUND) return 'notFound';
  return 'retry';
}
