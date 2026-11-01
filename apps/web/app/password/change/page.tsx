import { PasswordChangeScreen } from '@/features/auth/PasswordChangeScreen';

// S-PW 첫 로그인 비밀번호 변경 (Figma 14:748). 변경 전에는 /api/me가 403이라 가드 없이 연다
export default function PasswordChangePage() {
  return <PasswordChangeScreen reader="STUDENT" mode="first" />;
}
