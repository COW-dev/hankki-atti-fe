'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { homePathOf, useAuth, type Me, type Role } from '@/lib/auth/AuthProvider';

/**
 * 로그인이 필요한 화면에서 쓴다. 로그인 전이면 로그인 화면으로, 비밀번호 변경이 필요하면 변경 화면으로,
 * 다른 역할의 화면이면 그 역할의 홈으로 보낸다. 통과하면 내 정보를 돌려준다.
 */
export function useSessionGuard(allowedRole: Role): Me | null {
  const router = useRouter();
  const { status, authRequest } = useAuth();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
      return;
    }
    if (status !== 'authenticated') return;

    authRequest<Me>('/api/me')
      .then((result) => {
        if (result.role !== allowedRole) {
          router.replace(homePathOf(result.role));
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
  }, [status, authRequest, allowedRole, router]);

  return me;
}
