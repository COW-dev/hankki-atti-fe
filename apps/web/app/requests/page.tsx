'use client';

import { MyRequestsScreen } from '@/features/requests/MyRequestsScreen';
import { OpenRequestsScreen } from '@/features/requests/open/OpenRequestsScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 장애학생·도우미 탭바가 같은 경로를 가리키므로 역할로 나눈다 (StudentTabBar "내 신청" · HelperTabBar "요청 목록")
const ROLES = ['STUDENT', 'HELPER'] as const;

// 장애학생 F-02 내 신청 · 도우미 F-06 요청 목록 (Figma 208:3532)
export default function RequestsPage() {
  const me = useSessionGuard(ROLES);
  if (!me) return null;

  return me.role === 'HELPER' ? <OpenRequestsScreen /> : <MyRequestsScreen />;
}
