// 공지 대상 (백엔드 NoticeTarget). 아띠는 아띠 소속 도우미에게만 보인다
export type NoticeTarget = 'ALL' | 'STUDENT' | 'HELPER' | 'ATTI';

export const NOTICE_TARGET_LABEL: Record<NoticeTarget, string> = {
  ALL: '전체',
  STUDENT: '장애학생',
  HELPER: '도우미',
  ATTI: '아띠',
};
