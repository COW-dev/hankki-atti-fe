'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useAuth, type Me, type Role } from '@/lib/auth/AuthProvider';

/**
 * 로그인이 필요한 화면에서 쓴다. 로그인 전이면 로그인 화면으로, 비밀번호 변경이 필요하면 변경 화면으로 보낸다.
 * 통과하면 내 정보를 돌려준다.
 * 도메인마다 한 역할만 받으므로(lib/site.ts) 다른 역할이면 로그아웃시킨다 — 다른 역할의 홈은 이 도메인에 없다
 */
export function useSessionGuard(allowedRole: Role): Me | null {
  const router = useRouter();
  const { status, authRequest, logout } = useAuth();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
      return;
    }
    if (status !== 'authenticated') return;

    authRequest<Me>('/api/me')
      .then((result) => {
        // 로그아웃되면 status가 anonymous로 바뀌어 위에서 /login으로 보낸다
        if (result.role !== allowedRole) {
          void logout();
          return;
        }
        setMe(result);
      })
      .catch((error) => {
        if (error instanceof ApiError && error.code === ErrorCode.PASSWORD_CHANGE_REQUIRED) {
          router.replace('/password/change');
          return;
        }
        router.replace('/login');
      });
  }, [status, authRequest, logout, allowedRole, router]);

  return me;
}
