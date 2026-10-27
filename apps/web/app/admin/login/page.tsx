import { LoginScreen } from '@/features/auth/LoginScreen';
import { SITE_ROLE } from '@/lib/site';

// admin.domain.com/login — 관리자 목업이 나오기 전까지 사용자 로그인 화면을 그대로 쓴다
export default function AdminLoginPage() {
  return <LoginScreen role={SITE_ROLE.admin} />;
}
