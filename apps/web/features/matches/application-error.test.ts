import { describe, expect, it } from 'vitest';
import { applicationErrorMessage } from '@/features/matches/application-error';
import { ApiError } from '@/lib/api/client';

describe('applicationErrorMessage', () => {
  it('상태가 이미 바뀐 오류(404·409)는 목록을 다시 받으라고 한다', () => {
    expect(applicationErrorMessage(new ApiError(404, 'APPLICATION_NOT_FOUND', '없음'))).toEqual({
      message: '지원 내역을 찾을 수 없어요. 목록을 다시 불러올게요',
      reload: true,
    });
    expect(
      applicationErrorMessage(new ApiError(409, 'APPLICATION_INVALID_STATUS', '상태')),
    ).toEqual({ message: '이미 상태가 바뀐 건이에요. 목록을 다시 불러올게요', reload: true });
    expect(applicationErrorMessage(new ApiError(409, 'APPLICATION_MEAL_STARTED', '시작'))).toEqual({
      message: '식사가 시작돼 취소할 수 없어요. 목록을 다시 불러올게요',
      reload: true,
    });
    expect(
      applicationErrorMessage(new ApiError(409, 'APPLICATION_PROMOTION_EXPIRED', '마감')),
    ).toEqual({ message: '응답 마감이 지났어요. 목록을 다시 불러올게요', reload: true });
  });

  it('입력 문제(422)는 모달에 남겨 고칠 수 있게 한다', () => {
    expect(
      applicationErrorMessage(
        new ApiError(422, 'APPLICATION_CANCEL_REASON_DETAIL_REQUIRED', '내용 없음'),
      ),
    ).toEqual({ message: '기타 사유를 적어 주세요', reload: false });
    expect(
      applicationErrorMessage(new ApiError(422, 'APPLICATION_INVALID_CANCEL_REASON', '사유')),
    ).toEqual({ message: '고를 수 없는 사유예요. 다른 사유를 골라 주세요', reload: false });
    expect(
      applicationErrorMessage(new ApiError(422, 'COMMON_VALIDATION_FAILED', '200자 초과')),
    ).toEqual({ message: '200자 초과', reload: false });
  });

  it('네트워크 오류나 알 수 없는 오류는 다시 시도하라고 한다', () => {
    expect(applicationErrorMessage(new ApiError(0, undefined, '서버에 연결하지 못했어요'))).toEqual(
      { message: '서버에 연결하지 못했어요', reload: false },
    );
    expect(applicationErrorMessage(new Error('boom'))).toEqual({
      message: '잠시 후 다시 시도해 주세요',
      reload: false,
    });
  });
});
