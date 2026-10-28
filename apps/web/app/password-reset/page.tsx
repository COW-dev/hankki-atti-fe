import { PasswordResetScreen } from '@/features/password-reset/PasswordResetScreen';

// L-03 비밀번호 재설정 (Figma 204:601 · 204:738 · 204:875 · 204:1033 · 204:1167).
// 메일 링크(`/password-reset#token=…`)가 오는 곳이라 로그인 없이 연다
export default function PasswordResetPage() {
  return <PasswordResetScreen site="main" />;
}
