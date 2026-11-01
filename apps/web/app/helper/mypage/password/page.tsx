'use client';

import { PasswordChangeScreen } from '@/features/auth/PasswordChangeScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 도우미 F-05 비밀번호 변경 — helper.domain.com/mypage/password
export default function HelperMyPagePassword() {
  const me = useSessionGuard('HELPER');
  if (!me) return null;

  return <PasswordChangeScreen reader="HELPER" mode="mypage" />;
}
