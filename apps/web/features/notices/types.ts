import type { NoticeTarget } from '@/lib/labels/notice';

// GET /api/notices 한 줄 (백엔드 NoticeResponseDto)
export type NoticeSummary = {
  noticeId: number;
  title: string;
  pinned: boolean;
  publishedAt: string;
};

// GET /api/notices?page= (백엔드 NoticesResponseDto) — 고정 먼저, 그다음 최신 게시순 20개씩
export type NoticePage = {
  notices: NoticeSummary[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

// GET /api/notices/{id} (백엔드 NoticeDetailResponseDto). 본문은 일반 텍스트, editedAt은 수정한 적 없으면 null
export type NoticeDetail = {
  noticeId: number;
  title: string;
  body: string;
  target: NoticeTarget;
  pinned: boolean;
  publishedAt: string;
  editedAt: string | null;
};
