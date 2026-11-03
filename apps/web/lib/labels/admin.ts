import type { StatusTone } from '@hankki/ui';

// 관리자 권한 등급 (백엔드 AdminGrade). 사이드바 하단 태그 (Figma 14:1286 전체 · 14:1447 제한)
export type AdminGrade = 'FULL' | 'LIMITED';

export const ADMIN_GRADE_TAG: Record<AdminGrade, { tone: StatusTone; label: string }> = {
  FULL: { tone: 'info', label: '전체 권한' },
  LIMITED: { tone: 'neutral', label: '제한 권한' },
};
