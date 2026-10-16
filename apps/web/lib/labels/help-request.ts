import type { StatusTone } from '@hankki/ui';

// API는 enum 코드만 준다 (백엔드 HelpRequestStatus·HelpType). 표시 문구는 여기 한곳에서 매핑한다
export type HelpRequestStatus =
  'RECRUITING' | 'MATCHED' | 'FAILED' | 'CANCELED' | 'COMPLETED' | 'NO_SHOW';
export type HelpType = 'SERVING' | 'SEATING' | 'MOVING' | 'OTHER';
// GET /api/help-requests/open 항목 — 서버가 도우미 기준으로 계산한 지원 결과 예고와 불가 사유
export type ApplyOutcome = 'MATCH' | 'WAITING' | 'BLOCKED';
export type BlockReason = 'ALREADY_APPLIED' | 'TIME_OVERLAP' | 'WAITING_FULL';

// StatusTag 톤 (Figma 68:92 설명: 성공=매칭 완료, 진행=모집 중, 종료=이용 완료·취소됨, 경고=매칭 실패, 오류=노쇼)
export const HELP_REQUEST_STATUS: Record<HelpRequestStatus, { label: string; tone: StatusTone }> = {
  RECRUITING: { label: '모집 중', tone: 'progress' },
  MATCHED: { label: '매칭 완료', tone: 'success' },
  COMPLETED: { label: '이용 완료', tone: 'ended' },
  CANCELED: { label: '취소 완료', tone: 'ended' },
  FAILED: { label: '매칭 실패', tone: 'warning' },
  NO_SHOW: { label: '노쇼', tone: 'error' },
};

// F-06 카드 (Figma 208:3532): 바로 매칭=진행(시계), 예비 등록=중립(아이콘 없음), 지원 불가=종료(대시).
// 버튼 문구는 "지원하기" / "예비로 지원", 불가일 때는 버튼 대신 사유를 보여 준다
export const APPLY_OUTCOME: Record<
  ApplyOutcome,
  { label: string; tone: StatusTone; action: string | null }
> = {
  MATCH: { label: '바로 매칭', tone: 'progress', action: '지원하기' },
  WAITING: { label: '예비 등록', tone: 'neutral', action: '예비로 지원' },
  BLOCKED: { label: '지원 불가', tone: 'ended', action: null },
};

export const BLOCK_REASON_LABEL: Record<BlockReason, string> = {
  ALREADY_APPLIED: '이미 지원한 요청이에요',
  TIME_OVERLAP: '같은 시간에 매칭된 일정이 있어요',
  WAITING_FULL: '예비 인원이 다 찼어요',
};

export const HELP_TYPE_LABEL: Record<HelpType, string> = {
  SERVING: '배식 보조',
  SEATING: '좌석 안내',
  MOVING: '이동·운반 보조',
  OTHER: '기타',
};

// "배식 보조 · 좌석 안내 · 기타: 식판 반납" — 서버가 준 순서(배식·좌석·이동·기타)를 그대로 쓴다
export function helpTypesText(helpTypes: HelpType[], otherHelpText?: string | null): string {
  return helpTypes
    .map((type) =>
      type === 'OTHER' && otherHelpText ? `기타: ${otherHelpText}` : HELP_TYPE_LABEL[type],
    )
    .join(' · ');
}
