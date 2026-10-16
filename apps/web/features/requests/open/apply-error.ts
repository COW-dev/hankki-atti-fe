import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { BLOCK_REASON_LABEL } from '@/lib/labels/help-request';

const RELOAD_SUFFIX = '. 목록을 다시 불러올게요';

/**
 * 지원 실패를 안내 문구로 바꾼다. 서버 상태가 바뀐 경우(404·409)는 목록을 다시 받아야
 * 카드의 결과 예고(applyOutcome)가 맞게 보이므로 reload를 켠다. 네트워크 오류 등은 모달에 남겨 다시 누를 수 있게 한다.
 */
export function applyErrorMessage(error: unknown): { message: string; reload: boolean } {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ErrorCode.HELP_REQUEST_NOT_FOUND:
        return { message: `요청을 찾을 수 없어요${RELOAD_SUFFIX}`, reload: true };
      case ErrorCode.APPLICATION_NOT_OPEN:
        return {
          message: `모집이 끝났거나 식사가 시작된 요청이에요${RELOAD_SUFFIX}`,
          reload: true,
        };
      case ErrorCode.APPLICATION_ALREADY_APPLIED:
        return { message: `${BLOCK_REASON_LABEL.ALREADY_APPLIED}${RELOAD_SUFFIX}`, reload: true };
      case ErrorCode.APPLICATION_TIME_OVERLAP:
        return { message: `${BLOCK_REASON_LABEL.TIME_OVERLAP}${RELOAD_SUFFIX}`, reload: true };
      case ErrorCode.APPLICATION_WAITING_FULL:
        return { message: `${BLOCK_REASON_LABEL.WAITING_FULL}${RELOAD_SUFFIX}`, reload: true };
      default:
        return { message: error.message, reload: false };
    }
  }
  return { message: '잠시 후 다시 시도해 주세요', reload: false };
}
