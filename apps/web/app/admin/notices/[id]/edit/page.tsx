'use client';

import { use } from 'react';
import { AdminNoticeEditorScreen } from '@/features/admin-notices/AdminNoticeEditorScreen';

// admin.domain.com/notices/{id}/edit — 공지 수정 (A-12, 전체 권한만)
export default function AdminNoticeEditPage({ params }: PageProps<'/admin/notices/[id]/edit'>) {
  const { id } = use(params);
  return <AdminNoticeEditorScreen key={id} noticeId={Number(id)} />;
}
