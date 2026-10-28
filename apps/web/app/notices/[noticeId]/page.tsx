'use client';

import { use } from 'react';
import { NoticeDetailScreen } from '@/features/notices/NoticesScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 장애학생 F-03 공지 상세 (Figma 207:2304)
export default function NoticePage({ params }: PageProps<'/notices/[noticeId]'>) {
  const { noticeId } = use(params);
  const me = useSessionGuard('STUDENT');
  if (!me) return null;

  // 다른 공지로 넘어가면 이전 공지가 남지 않게 새로 그린다
  return <NoticeDetailScreen key={noticeId} reader="STUDENT" noticeId={noticeId} />;
}
