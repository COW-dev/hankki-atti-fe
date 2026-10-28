import { addDays, formatDateShort, isSameDay } from './datetime';

// 알림 시각 (명세 §2.3 "방금 / 10분 전 / 어제"): 1분 안 방금, 1시간 안 N분 전, 같은 날 N시간 전, 전날 어제, 그 전은 날짜.
// 서버 시계가 조금 빨라 미래 시각이 와도 방금으로 보인다
export function formatRelativeTime(at: Date, now: Date): string {
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (isSameDay(at, now)) return `${Math.floor(minutes / 60)}시간 전`;
  if (isSameDay(at, addDays(now, -1))) return '어제';
  return formatDateShort(at);
}
