import { ApiError } from './client';

export const RETRY_MESSAGE = '잠시 후 다시 시도해 주세요';
const NETWORK_MESSAGE = `서버에 연결하지 못했어요. ${RETRY_MESSAGE}`;

/**
 * 화면에서 code로 분기하지 않은 오류의 표시 문구. 서버 message는 말투가 화면과 달라 보여 주지 않고,
 * 연결 실패(status 0)만 따로 알린다. 화면마다 다른 기본 문구(예: "신청을 불러오지 못했어요")는 fallback으로 받는다
 */
export function errorMessage(error: unknown, fallback = RETRY_MESSAGE): string {
  if (error instanceof ApiError && error.status === 0) return NETWORK_MESSAGE;
  return fallback;
}
