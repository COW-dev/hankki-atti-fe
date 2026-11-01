'use client';

import { PasswordChangeScreen } from '@/features/auth/PasswordChangeScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 장애학생 F-05 비밀번호 변경. 도우미는 helper.domain.com/mypage/password
export default function MyPagePassword() {
  const me = useSessionGuard('STUDENT');
  if (!me) return null;

  return <PasswordChangeScreen reader="STUDENT" mode="mypage" />;
}
