'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@hankki/ui';
import { Footer } from '@/components/layout/Footer';
import { Logo } from '@/components/ui/Logo';
import { ErrorNotice } from '@hankki/ui';
import { Block } from '@hankki/ui';
import { PageShell } from '@/components/layout/PageShell';
import { TextField } from '@hankki/ui';
import { TopBar } from '@/components/layout/TopBar';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { homePathOf, useAuth, type Role } from '@/lib/auth/AuthProvider';
import { siteUrl } from '@/lib/site';

const ROLE_LABEL: Record<Role, string> = { STUDENT: '장애학생', HELPER: '도우미', ADMIN: '관리자' };

// L-01 로그인 (Figma 203:240 기본 · 203:433 실패 · 203:635 비활성 계정).
// 도메인마다 한 역할만 받는다 — 메인 STUDENT, helper. HELPER, admin. ADMIN (lib/site.ts SITE_ROLE)
export function LoginScreen({ role }: { role: Role }) {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);
    setPasswordError(undefined);
    try {
      const result = await login(loginId.trim(), password);
      if (result.role !== role) {
        // 이 도메인의 refresh 쿠키를 남기지 않는다. 문구는 목업에 없어 임시로 둔다
        await logout();
        setNotice(`이 주소에서는 ${ROLE_LABEL[role]} 계정으로만 로그인할 수 있어요`);
        return;
      }
      router.replace(result.mustChangePassword ? '/password/change' : homePathOf(result.role));
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.ACCOUNT_DEACTIVATED) {
        setNotice(error.message);
      } else if (error instanceof ApiError && error.code === ErrorCode.LOGIN_FAILED) {
        setNotice('아이디 또는 비밀번호가 맞지 않아요');
        setPasswordError('비밀번호를 다시 확인해 주세요');
      } else {
        setNotice(error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell size="L" topBar={<TopBar title="로그인" back />} footer={<Footer copyright />}>
      <Block gap="md">
        <div className="flex w-full flex-col items-center pt-1 pb-3">
          <Logo variant="large" />
        </div>
        {notice && <ErrorNotice message={notice} />}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-(--space-md)" noValidate>
          <TextField
            label="아이디"
            name="loginId"
            autoComplete="username"
            placeholder="학번 또는 이메일"
            required
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
          />
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력해 주세요"
            required
            value={password}
            error={passwordError}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" inactive={submitting} className="w-full">
            로그인
          </Button>
        </form>
        <div className="flex w-full items-center justify-center gap-(--space-sm) whitespace-nowrap">
          {role !== 'ADMIN' && (
            <>
              <Link
                href={role === 'HELPER' ? '/signup' : siteUrl('helper', '/signup')}
                className="typo-caption-strong text-(--color-text-secondary)"
              >
                도우미 회원가입
              </Link>
              <span aria-hidden className="typo-caption text-(--color-text-disabled)">
                |
              </span>
            </>
          )}
          <Link
            href="/password/reset"
            className="typo-caption-strong text-(--color-text-secondary)"
          >
            비밀번호를 잊었어요
          </Link>
        </div>
      </Block>
    </PageShell>
  );
}
