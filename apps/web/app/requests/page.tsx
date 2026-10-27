'use client';

import { MyRequestsScreen } from '@/features/requests/MyRequestsScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 장애학생 F-02 내 신청 (Figma 208:3532). 도우미 요청 목록은 helper.domain.com/requests (app/helper/requests)
export default function RequestsPage() {
  const me = useSessionGuard('STUDENT');
  if (!me) return null;

  return <MyRequestsScreen />;
}
