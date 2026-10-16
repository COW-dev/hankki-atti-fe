import { describe, expect, it } from 'vitest';
import { applyErrorMessage } from '@/features/requests/open/apply-error';
import { ApiError } from '@/lib/api/client';

describe('applyErrorMessage', () => {
  it('서버 상태가 바뀐 409·404는 사유를 안내하고 목록을 다시 받는다', () => {
    expect(applyErrorMessage(new ApiError(409, 'APPLICATION_ALREADY_APPLIED', 'x'))).toEqual({
      message: '이미 지원한 요청이에요. 목록을 다시 불러올게요',
      reload: true,
    });
    expect(applyErrorMessage(new ApiError(409, 'APPLICATION_TIME_OVERLAP', 'x'))).toEqual({
      message: '같은 시간에 매칭된 일정이 있어요. 목록을 다시 불러올게요',
      reload: true,
    });
    expect(applyErrorMessage(new ApiError(409, 'APPLICATION_WAITING_FULL', 'x'))).toEqual({
      message: '예비 인원이 다 찼어요. 목록을 다시 불러올게요',
      reload: true,
    });
    expect(applyErrorMessage(new ApiError(409, 'APPLICATION_NOT_OPEN', 'x'))).toEqual({
      message: '모집이 끝났거나 식사가 시작된 요청이에요. 목록을 다시 불러올게요',
      reload: true,
    });
    expect(applyErrorMessage(new ApiError(404, 'HELP_REQUEST_NOT_FOUND', 'x')).reload).toBe(true);
  });

  it('모르는 API 오류는 서버 문구를, 그 밖의 오류는 기본 문구를 쓰고 목록은 그대로 둔다', () => {
    expect(applyErrorMessage(new ApiError(403, 'AUTH_FORBIDDEN', '권한이 없어요'))).toEqual({
      message: '권한이 없어요',
      reload: false,
    });
    expect(applyErrorMessage(new TypeError('fetch failed'))).toEqual({
      message: '잠시 후 다시 시도해 주세요',
      reload: false,
    });
  });
});
