import type { StatusTone } from '@hankki/ui';

// API는 enum 코드만 준다 (백엔드 HelpRequestStatus·HelpType). 표시 문구는 여기 한곳에서 매핑한다
export type HelpRequestStatus =
  'RECRUITING' | 'MATCHED' | 'FAILED' | 'CANCELED' | 'COMPLETED' | 'NO_SHOW';
export type HelpType = 'SERVING' | 'SEATING' | 'MOVING' | 'OTHER';

// StatusTag 톤 (Figma 68:92 설명: 성공=매칭 완료, 진행=모집 중, 종료=이용 완료·취소됨, 경고=매칭 실패, 오류=노쇼)
export const HELP_REQUEST_STATUS: Record<HelpRequestStatus, { label: string; tone: StatusTone }> = {
  RECRUITING: { label: '모집 중', tone: 'progress' },
  MATCHED: { label: '매칭 완료', tone: 'success' },
  COMPLETED: { label: '이용 완료', tone: 'ended' },
  CANCELED: { label: '취소 완료', tone: 'ended' },
  FAILED: { label: '매칭 실패', tone: 'warning' },
  NO_SHOW: { label: '노쇼', tone: 'error' },
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
