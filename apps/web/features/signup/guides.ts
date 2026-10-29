// L-02 1단계 안내 자료 (Figma 14:989). 순서·이름은 목업, type은 서버 장애 유형 enum
// content가 null이면 "자료 준비 중" — 자료 제작·준비 중 처리 기준은 백로그 D-06에서 정한다
export const SIGNUP_GUIDES = [
  { type: 'VISUAL', name: '시각 장애', content: null },
  { type: 'HEARING', name: '청각 장애', content: null },
  { type: 'PHYSICAL', name: '지체 장애', content: null },
  { type: 'SPEECH', name: '언어 장애', content: null },
  { type: 'INTELLECTUAL', name: '지적 장애', content: null },
  { type: 'AUTISM_BRAIN_LESION', name: '자폐/뇌병변 장애', content: null },
  { type: 'KIDNEY_HEART_STOMA', name: '간/신장/심장/장루요루 장애', content: null },
] as const satisfies readonly { type: string; name: string; content: string | null }[];

export type GuideType = (typeof SIGNUP_GUIDES)[number]['type'];
