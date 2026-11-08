'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { homePathOf, useAuth, type Me, type Role } from '@/lib/auth/AuthProvider';
import type { AdminGrade } from '@/lib/labels/admin';
import { rolePath } from '@/lib/site';

// GET /api/admin/me (AdminMeResponseDto) — 사이드바에 이름·권한 태그를 그린다
export type AdminMe = Me & { name: string; grade: AdminGrade };

/**
 * 로그인이 필요한 화면에서 쓴다. 로그인 전이면 로그인 화면으로, 비밀번호 변경이 필요하면 변경 화면으로 보낸다.
 * 통과하면 내 정보를 돌려준다.
 * 장애학생·도우미가 서로의 화면에 들어오면 자기 첫 화면으로 보낸다
 */
export function useSessionGuard(allowedRole: 'ADMIN'): AdminMe | null;
export function useSessionGuard(allowedRole: Role): Me | null;
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

    // 관리자 토큰은 /api/me를 쓸 수 없다. 관리자 토큰이면 역할은 ADMIN으로 정해져 있다
    const fetchMe =
      allowedRole === 'ADMIN'
        ? authRequest<Omit<AdminMe, 'role' | 'accessibilityMode'>>('/api/admin/me').then(
            (admin): AdminMe => ({ ...admin, role: 'ADMIN', accessibilityMode: false }),
          )
        : authRequest<Me>('/api/me');
    fetchMe
      .then((result) => {
        if (result.role !== allowedRole) {
          router.replace(homePathOf(result.role));
          return;
        }
        setMe(result);
      })
      .catch((error) => {
        if (error instanceof ApiError && error.code === ErrorCode.PASSWORD_CHANGE_REQUIRED) {
          router.replace(rolePath(allowedRole, '/password/change'));
          return;
        }
        router.replace('/login');
      });
  }, [status, authRequest, allowedRole, router]);

  return me;
}
