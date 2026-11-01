import { PasswordChangeScreen } from '@/features/auth/PasswordChangeScreen';

// 임시 비밀번호로 로그인한 도우미의 강제 변경 — helper.domain.com/password/change.
// 변경 전에는 /api/me가 403이라 가드 없이 연다
export default function HelperPasswordChangePage() {
  return <PasswordChangeScreen reader="HELPER" mode="first" />;
}
