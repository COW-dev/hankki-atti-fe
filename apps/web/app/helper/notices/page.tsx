'use client';

import { NoticesScreen } from '@/features/notices/NoticesScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 도우미 F-03 공지사항 (Figma 209:3974) — helper.domain.com/notices
export default function HelperNoticesPage() {
  const me = useSessionGuard('HELPER');
  if (!me) return null;

  return <NoticesScreen reader="HELPER" />;
}
