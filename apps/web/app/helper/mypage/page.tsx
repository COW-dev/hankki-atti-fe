'use client';

import { MyPageScreen } from '@/features/mypage/MyPageScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 도우미 F-05 마이페이지 (Figma 14:1192) — helper.domain.com/mypage
export default function HelperMyPage() {
  const me = useSessionGuard('HELPER');
  if (!me) return null;

  return <MyPageScreen reader="HELPER" />;
}
