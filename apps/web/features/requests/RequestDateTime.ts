import { formatDateTimeRange, parseLocalDateTime } from '@/lib/format/datetime';
import type { MyHelpRequest } from './types';

// 카드 제목 "10월 7일 (화) 12:00 ~ 13:00"
export function requestTitle(request: Pick<MyHelpRequest, 'startAt' | 'endAt'>): string {
  return formatDateTimeRange(
    parseLocalDateTime(request.startAt),
    parseLocalDateTime(request.endAt),
  );
}
