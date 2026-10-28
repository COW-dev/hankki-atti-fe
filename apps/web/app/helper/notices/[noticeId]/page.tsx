'use client';

import { use } from 'react';
import { NoticeDetailScreen } from '@/features/notices/NoticesScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 도우미 F-03 공지 상세 (Figma 209:4138) — helper.domain.com/notices/{id}
export default function HelperNoticePage({ params }: PageProps<'/helper/notices/[noticeId]'>) {
  const { noticeId } = use(params);
  const me = useSessionGuard('HELPER');
  if (!me) return null;

  // 다른 공지로 넘어가면 이전 공지가 남지 않게 새로 그린다
  return <NoticeDetailScreen key={noticeId} reader="HELPER" noticeId={noticeId} />;
}
