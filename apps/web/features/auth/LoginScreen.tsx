'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@hankki/ui';
import { Footer } from '@/components/layout/Footer';
import { Logo } from '@/components/ui/Logo';
import { ErrorNotice } from '@hankki/ui';
import { Block } from '@hankki/ui';
import { PageShell } from '@/components/layout/PageShell';
import { TextField, Toast } from '@hankki/ui';
import { TopBar } from '@/components/layout/TopBar';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { loginEvents } from '@/lib/accessibility/login-event';
import { homePathOf, useAuth, type Role } from '@/lib/auth/AuthProvider';
import { joinedSignup } from '@/features/signup/joined';
import { siteUrl } from '@/lib/site';

const ROLE_LABEL: Record<Role, string> = { STUDENT: '장애학생', HELPER: '도우미', ADMIN: '관리자' };

// L-01 로그인 (Figma 203:240 기본 · 203:433 실패 · 203:635 비활성 계정).
// 도메인마다 한 역할만 받는다 — 메인 STUDENT, helper. HELPER, admin. ADMIN (lib/site.ts SITE_ROLE)
export function LoginScreen({ role }: { role: Role }) {
  const router = useRouter();
  const { login, logout } = useAuth();
  // 도우미 가입 직후면 가입한 이메일을 채우고 토스트로 알린다 (U-15)
  const [joinedEmail] = useState(joinedSignup.peek);
  const [loginId, setLoginId] = useState(joinedEmail ?? '');
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!joinedEmail) return;
    joinedSignup.clear();
    // live 영역이 먼저 그려진 뒤 문구를 넣어야 스크린리더가 읽는다. 문구는 목업에 없어 임시로 둔다
    const timer = setTimeout(() => setToast('가입했어요. 로그인해 주세요'));
    return () => clearTimeout(timer);
  }, [joinedEmail]);
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
      // 다른 계정으로 바로 로그인해도 그 계정의 접근성 설정으로 다시 맞춘다 (U-06)
      loginEvents.notify();
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
        {/* 관리자 계정은 백엔드가 비밀번호 재설정을 받지 않아(장애학생·도우미만) 두 링크 모두 숨긴다 */}
        {role !== 'ADMIN' && (
          <div className="flex w-full items-center justify-center gap-(--space-sm) whitespace-nowrap">
            <Link
              href={role === 'HELPER' ? '/signup' : siteUrl('helper', '/signup')}
              className="typo-caption-strong text-(--color-text-secondary)"
            >
              도우미 회원가입
            </Link>
            <span aria-hidden className="typo-caption text-(--color-text-disabled)">
              |
            </span>
            {/* 메일 링크와 같은 경로 (백엔드 PasswordResetService LINK_PATH) */}
            <Link
              href="/password-reset"
              className="typo-caption-strong text-(--color-text-secondary)"
            >
              비밀번호를 잊었어요
            </Link>
          </div>
        )}
      </Block>
      <Toast message={toast} onClose={closeToast} />
    </PageShell>
  );
}
