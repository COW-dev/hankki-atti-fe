'use client';

import { NoticesScreen } from '@/features/notices/NoticesScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 장애학생 F-03 공지사항 (Figma 207:2140). 도우미 공지는 helper.domain.com/notices (app/helper/notices)
export default function NoticesPage() {
  const me = useSessionGuard('STUDENT');
  if (!me) return null;

  return <NoticesScreen reader="STUDENT" />;
}
