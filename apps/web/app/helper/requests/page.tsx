'use client';

import { OpenRequestsScreen } from '@/features/requests/open/OpenRequestsScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 도우미 F-06 요청 목록 (Figma 208:3532) — helper.domain.com/requests
export default function HelperRequestsPage() {
  const me = useSessionGuard('HELPER');
  if (!me) return null;

  return <OpenRequestsScreen />;
}
