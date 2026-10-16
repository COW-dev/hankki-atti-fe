import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';

const RELOAD_SUFFIX = '. 목록을 다시 불러올게요';

/**
 * 취소·빠지기·승격 응답 실패를 안내 문구로 바꾼다. 서버 상태가 이미 바뀐 경우(404·409)는 카드가 맞지 않으므로
 * 모달을 닫고 목록을 다시 받는다(reload). 입력 문제(422)·네트워크 오류는 모달에 남겨 다시 누를 수 있게 한다.
 */
export function applicationErrorMessage(error: unknown): { message: string; reload: boolean } {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ErrorCode.APPLICATION_NOT_FOUND:
        return { message: `지원 내역을 찾을 수 없어요${RELOAD_SUFFIX}`, reload: true };
      case ErrorCode.APPLICATION_INVALID_STATUS:
        return { message: `이미 상태가 바뀐 건이에요${RELOAD_SUFFIX}`, reload: true };
      case ErrorCode.APPLICATION_MEAL_STARTED:
        return { message: `식사가 시작돼 취소할 수 없어요${RELOAD_SUFFIX}`, reload: true };
      case ErrorCode.APPLICATION_PROMOTION_EXPIRED:
        return { message: `응답 마감이 지났어요${RELOAD_SUFFIX}`, reload: true };
      case ErrorCode.APPLICATION_CANCEL_REASON_DETAIL_REQUIRED:
        return { message: '기타 사유를 적어 주세요', reload: false };
      case ErrorCode.APPLICATION_INVALID_CANCEL_REASON:
        return { message: '고를 수 없는 사유예요. 다른 사유를 골라 주세요', reload: false };
      default:
        return { message: error.message, reload: false };
    }
  }
  return { message: '잠시 후 다시 시도해 주세요', reload: false };
}
