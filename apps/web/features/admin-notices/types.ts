import type { NoticeTarget } from '@/lib/labels/notice';

// GET /api/admin/notices 한 줄 (백엔드 AdminNoticeResponseDto). editedAt은 수정한 적 없으면 null
export type AdminNoticeSummary = {
  noticeId: number;
  title: string;
  target: NoticeTarget;
  pinned: boolean;
  publishedAt: string;
  editedAt: string | null;
};

// GET /api/admin/notices?page= — 고정 먼저, 그다음 최신 게시순 20개씩
export type AdminNoticePage = {
  notices: AdminNoticeSummary[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

// GET /api/admin/notices/{id} (백엔드 AdminNoticeDetailResponseDto)
export type AdminNoticeDetail = AdminNoticeSummary & { body: string };
