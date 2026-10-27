import { LoginScreen } from '@/features/auth/LoginScreen';
import { SITE_ROLE } from '@/lib/site';

export default function LoginPage() {
  return <LoginScreen role={SITE_ROLE.main} />;
}
