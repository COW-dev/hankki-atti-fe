import { PasswordResetScreen } from '@/features/password-reset/PasswordResetScreen';

// helper.domain.com/password-reset — 도우미 로그인의 "비밀번호를 잊었어요"에서 온다
export default function HelperPasswordResetPage() {
  return <PasswordResetScreen site="helper" />;
}
