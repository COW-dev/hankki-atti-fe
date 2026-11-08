'use client';

import { MyPageScreen } from '@/features/mypage/MyPageScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 장애학생 F-05 마이페이지 (Figma 14:954). 도우미는 /helper/mypage (app/helper/mypage)
export default function MyPage() {
  const me = useSessionGuard('STUDENT');
  if (!me) return null;

  return <MyPageScreen reader="STUDENT" />;
}
