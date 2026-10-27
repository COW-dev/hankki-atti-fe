import { LoginScreen } from '@/features/auth/LoginScreen';
import { SITE_ROLE } from '@/lib/site';

// helper.domain.com/login
export default function HelperLoginPage() {
  return <LoginScreen role={SITE_ROLE.helper} />;
}
