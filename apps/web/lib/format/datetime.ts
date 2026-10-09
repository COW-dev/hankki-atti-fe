// 서버 시각은 Asia/Seoul의 LocalDateTime("2026-10-12T12:00:00", 시간대 없음)이다.
// Date 생성자에 그대로 넘기면 브라우저 시간대에 따라 달라질 수 있어 직접 쪼개서 만든다

export type Meal = 'LUNCH' | 'DINNER';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
// 점심 시작 시각은 11:30~13:00, 저녁은 17:00~17:30 — 15시를 기준으로 가른다
const DINNER_FROM_HOUR = 15;

export function parseLocalDateTime(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value);
  if (!match) throw new Error(`시각 형식이 아니에요: ${value}`);
  const [, year, month, day, hour, minute, second = '0'] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
}

// "10월 7일 (화)"
export function formatDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

// "12:00"
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// "12:00 ~ 13:00"
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} ~ ${formatTime(end)}`;
}

// "10월 2일 (목) 12:30"
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// "10월 7일 (화) 12:00 ~ 13:00"
export function formatDateTimeRange(start: Date, end: Date): string {
  return `${formatDate(start)} ${formatTimeRange(start, end)}`;
}

export function mealOf(startAt: Date): Meal {
  return startAt.getHours() < DINNER_FROM_HOUR ? 'LUNCH' : 'DINNER';
}

export const MEAL_LABEL: Record<Meal, string> = { LUNCH: '점심', DINNER: '저녁' };

// 다음 식사 안내 (F-02 "오늘 저녁 · 다음 식사"): 오늘·내일은 상대 표현, 그 밖은 날짜
export function relativeMealLabel(startAt: Date, now: Date): string {
  const days = daysBetween(startOfDay(now), startOfDay(startAt));
  const meal = MEAL_LABEL[mealOf(startAt)];
  if (days === 0) return `오늘 ${meal}`;
  if (days === 1) return `내일 ${meal}`;
  return `${formatDate(startAt)} ${meal}`;
}

// "10월 9일" (요약 "10월 9일 12:00 ~ 13:00 · 1시간"용)
export function formatDateShort(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 서버 날짜 "2026-10-09" → 그날 0시
export function parseLocalDate(value: string): Date {
  return parseLocalDateTime(`${value}T00:00`);
}

// F-01 날짜 칩: 오늘 "오늘 10/9", 내일 "내일 10/10", 그 밖 "10/13 (월)" (Figma 206:1504)
export function dateChipLabel(date: Date, now: Date): string {
  const days = daysBetween(startOfDay(now), startOfDay(date));
  const short = `${date.getMonth() + 1}/${date.getDate()}`;
  if (days === 0) return `오늘 ${short}`;
  if (days === 1) return `내일 ${short}`;
  return `${short} (${WEEKDAYS[date.getDay()]})`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return daysBetween(startOfDay(a), startOfDay(b)) === 0;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
