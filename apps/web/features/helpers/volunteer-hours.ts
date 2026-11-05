// 서버 검증과 같은 범위 (VolunteerHoursUpdateRequestDto: 0~10시간, 0.5시간 단위, 사유 200자)
export const MIN_VOLUNTEER_HOURS = 0;
export const MAX_VOLUNTEER_HOURS = 10;
export const VOLUNTEER_HOURS_STEP = 0.5;
export const VOLUNTEER_REASON_MAX = 200;

export function clampVolunteerHours(hours: number): number {
  return Math.min(MAX_VOLUNTEER_HOURS, Math.max(MIN_VOLUNTEER_HOURS, hours));
}

// 저장할 수 없는 이유. 저장 버튼이 inactive일 때 스크린리더로 읽어 준다
export function volunteerHoursBlockReason(
  hours: number,
  currentHours: number,
  reason: string,
): string | null {
  if (hours === currentHours) return '봉사시간을 바꿔 주세요';
  const length = reason.trim().length;
  if (length === 0) return '수정 사유를 입력해 주세요';
  if (length > VOLUNTEER_REASON_MAX)
    return `수정 사유는 ${VOLUNTEER_REASON_MAX}자까지 쓸 수 있어요`;
  return null;
}
