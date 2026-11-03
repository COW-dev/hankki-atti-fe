'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ErrorNotice, TextField } from '@hankki/ui';
import { Logo } from '@/components/ui/Logo';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';

// AL-01 관리자 로그인 (Figma 14:1249 기본 · 14:1261 실패). 관리자 API는 관리자 계정만 받고 첫 비밀번호 변경이 없어
// 사용자 LoginScreen의 역할 불일치·변경 화면 분기가 필요 없다. 가입·비밀번호 찾기는 두지 않는다 (AL-01 명세)
export function AdminLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
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
      await login(loginId.trim(), password);
      router.replace('/');
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.ACCOUNT_DEACTIVATED) {
        setNotice('사용이 중지된 계정이에요. 센터(02-300-1529)로 문의해 주세요');
      } else if (error instanceof ApiError && error.code === ErrorCode.LOGIN_FAILED) {
        setNotice('아이디 또는 비밀번호가 맞지 않아요');
        setPasswordError('비밀번호를 다시 확인해 주세요');
      } else {
        setNotice(errorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-size="admin" className="flex min-h-screen w-full flex-col bg-(--color-bg-subtle)">
      <main className="flex flex-1 items-center justify-center p-10">
        <div className="flex w-full max-w-[440px] flex-col items-center gap-3.5 rounded-(--radius-lg) bg-(--color-bg-default) p-10">
          <Logo variant="adminLogin" />
          <h1 className="typo-title text-center text-(--color-text-primary)">관리자 로그인</h1>
          <p className="typo-caption text-center text-(--color-text-secondary)">
            장애학생지원센터 · 아띠 운영진 전용
          </p>
          <div className="mt-1 flex w-full flex-col gap-3.5">
            {notice && <ErrorNotice message={notice} />}
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3.5" noValidate>
              <TextField
                label="아이디"
                name="loginId"
                autoComplete="username"
                placeholder="아이디를 입력하세요"
                required
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
              />
              <TextField
                label="비밀번호"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호를 입력하세요"
                required
                value={password}
                error={passwordError}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button type="submit" inactive={submitting} className="mt-1 w-full">
                로그인
              </Button>
            </form>
          </div>
          <p className="typo-caption text-center text-(--color-text-secondary)">
            계정 문의: 장애학생지원센터 02-300-1529
          </p>
        </div>
      </main>
      <footer className="px-10 pb-5">
        <p className="typo-caption text-(--color-text-secondary)">
          명지대학교 장애학생지원센터 · © 2026 한끼아띠
        </p>
      </footer>
    </div>
  );
}
