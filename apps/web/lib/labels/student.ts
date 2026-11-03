import type { StatusTone } from '@hankki/ui';

// 장애 유형 (백엔드 DisabilityType). 표시 순서는 백엔드 enum 순서를 따른다
export type DisabilityType =
  | 'KIDNEY_HEART_STOMA'
  | 'SPEECH'
  | 'AUTISM_BRAIN_LESION'
  | 'INTELLECTUAL'
  | 'PHYSICAL'
  | 'HEARING'
  | 'VISUAL';

export const DISABILITY_TYPE_LABEL: Record<DisabilityType, string> = {
  KIDNEY_HEART_STOMA: '간/신장/심장/장루요루',
  SPEECH: '언어',
  AUTISM_BRAIN_LESION: '자폐/뇌병변',
  INTELLECTUAL: '지적',
  PHYSICAL: '지체',
  HEARING: '청각',
  VISUAL: '시각',
};

// 계정 상태 (백엔드 AccountStatus). Figma 14:1338 활성(정보) · 14:1418 비활성(종료, 아이콘)
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export const ACCOUNT_STATUS_TAG: Record<AccountStatus, { tone: StatusTone; label: string }> = {
  ACTIVE: { tone: 'info', label: '활성' },
  INACTIVE: { tone: 'ended', label: '비활성' },
};
