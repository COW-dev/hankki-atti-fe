import { describe, expect, it } from 'vitest';
import { ApiError } from './client';
import { errorMessage } from './error-message';

describe('errorMessage', () => {
  it('서버가 준 오류면 서버 message 대신 기본 문구를 돌려준다', () => {
    const error = new ApiError(500, 'COMMON_INTERNAL_ERROR', 'Internal Server Error');

    expect(errorMessage(error)).toBe('잠시 후 다시 시도해 주세요');
  });

  it('화면 기본 문구를 주면 그 문구를 돌려준다', () => {
    const error = new ApiError(400, 'UNKNOWN', '잘못된 요청입니다.');

    expect(errorMessage(error, '신청을 불러오지 못했어요')).toBe('신청을 불러오지 못했어요');
  });

  it('서버에 연결하지 못했으면 연결 실패 문구를 돌려준다', () => {
    const error = new ApiError(0, undefined, '서버에 연결하지 못했어요.');

    expect(errorMessage(error, '신청을 불러오지 못했어요')).toBe(
      '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요',
    );
  });

  it('ApiError가 아니면 기본 문구를 돌려준다', () => {
    expect(errorMessage(new TypeError('Failed to fetch'))).toBe('잠시 후 다시 시도해 주세요');
  });
});
