// 백엔드 NotificationResponseDto. 문장(message)은 서버가 종류별로 만들어 주므로 그대로 그린다
export type NotificationType =
  | 'REQUEST_MATCHED'
  | 'HELPER_CHANGED'
  | 'REQUEST_REOPENED'
  | 'REQUEST_FAILED'
  | 'APPLICATION_MATCHED'
  | 'WAITING_REGISTERED'
  | 'PROMOTED'
  | 'PROMOTION_RESPONSE_REQUIRED'
  | 'STUDENT_CANCELED'
  | 'WAITING_EXCLUDED'
  | 'NOTICE_PUBLISHED';

// 누르면 이동할 대상: 신청(장애학생 F-02) · 지원(도우미 F-07) · 공지(F-03 상세)
export type NotificationTargetType = 'HELP_REQUEST' | 'APPLICATION' | 'NOTICE';

// 브라우저 전역 Notification과 이름이 겹치지 않게 AppNotification으로 둔다
export type AppNotification = {
  id: number;
  type: NotificationType;
  message: string;
  targetType: NotificationTargetType;
  targetId: number;
  read: boolean;
  createdAt: string;
};

// 최신순 한 페이지. nextCursor가 null이면 더 없다
export type NotificationPage = { items: AppNotification[]; nextCursor: number | null };
