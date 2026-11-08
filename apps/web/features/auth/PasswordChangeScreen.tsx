'use client';

import { Block, Button, ErrorNotice, TextField } from '@hankki/ui';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { HelperTabBar, StudentTabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useAuth } from '@/lib/auth/AuthProvider';
import { checkPassword, PASSWORD_MAX_LENGTH } from '@/lib/auth/password-policy';
import { rolePath } from '@/lib/site';
import { passwordChanged } from './password-changed';
import { PasswordRules } from './PasswordRules';
import { errorMessage } from '@/lib/api/error-message';

export type PasswordChangeReader = 'STUDENT' | 'HELPER';

/**
 * 비밀번호 변경 폼.
 * - first: 받은 비밀번호로 처음 로그인한 뒤 강제 변경 (S-PW, Figma 14:748). 탭바·알림 없이 이 화면만 쓴다
 * - mypage: 마이페이지에서 들어온 일반 변경 (F-05). 목업이 없어 S-PW의 입력칸에 하위 화면 틀(뒤로·탭바)을 씌웠다
 */
export function PasswordChangeScreen({
  reader,
  mode,
}: {
  reader: PasswordChangeReader;
  mode: 'first' | 'mypage';
}) {
  const router = useRouter();
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentError, setCurrentError] = useState<string | undefined>();
  const [nextError, setNextError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const first = mode === 'first';
  const results = checkPassword(next);
  const remaining = results.filter((rule) => !rule.passed).length;
  const confirmError =
    confirm.length > 0 && confirm !== next ? '새 비밀번호와 같게 입력해 주세요' : undefined;
  const ready = current.length > 0 && remaining === 0 && confirm.length > 0 && confirm === next;
  const remainingGuide = ready
    ? ''
    : `조건 ${remaining + (confirm.length > 0 && confirm === next ? 0 : 1)}개 남음. `;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setNotice(null);
    setCurrentError(undefined);
    setNextError(undefined);
    try {
      await changePassword(current, next);
      if (first) {
        router.replace('/');
      } else {
        passwordChanged.mark();
        router.replace(rolePath(reader, '/mypage'));
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.CURRENT_PASSWORD_MISMATCH) {
        setCurrentError(first ? '받은 비밀번호가 맞지 않아요' : '현재 비밀번호가 맞지 않아요');
      } else if (error instanceof ApiError && error.code === ErrorCode.SAME_AS_CURRENT_PASSWORD) {
        setNextError('지금 쓰는 비밀번호와 다르게 만들어 주세요');
      } else if (error instanceof ApiError && error.code === ErrorCode.UNAUTHENTICATED) {
        router.replace('/login');
      } else {
        setNotice(errorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const tabBar =
    reader === 'STUDENT' ? <StudentTabBar active="/mypage" /> : <HelperTabBar active="/mypage" />;

  return (
    <PageShell
      size={reader === 'STUDENT' ? 'L' : 'M'}
      topBar={
        first ? <TopBar title="비밀번호 변경" logo /> : <TopBar title="비밀번호 변경" back bell />
      }
      footer={<Footer withTabBar={!first} />}
      tabBar={first ? undefined : tabBar}
    >
      <Block>
        {first && (
          <>
            {/* 도우미는 처음 로그인이 아니라 센터가 보낸 임시 비밀번호로 들어온다. 문구는 목업에 없어 임시로 둔다 */}
            <h2 className="typo-title w-full">
              {reader === 'STUDENT' ? '처음 로그인하셨어요' : '임시 비밀번호로 로그인하셨어요'}
            </h2>
            <p className="typo-body w-full text-(--color-text-secondary)">
              안전을 위해 비밀번호를 바꿔 주세요
            </p>
          </>
        )}
        {notice && <ErrorNotice message={notice} />}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-(--space-sm)" noValidate>
          <TextField
            label={first ? '받은 비밀번호' : '현재 비밀번호'}
            type="password"
            autoComplete="current-password"
            placeholder={first ? '이메일로 받은 비밀번호' : '지금 쓰는 비밀번호'}
            required
            value={current}
            error={currentError}
            onChange={(event) => setCurrent(event.target.value)}
          />
          <TextField
            label="새 비밀번호"
            type="password"
            autoComplete="new-password"
            placeholder="새 비밀번호"
            required
            maxLength={PASSWORD_MAX_LENGTH}
            describedBy="password-rules"
            value={next}
            error={nextError}
            onChange={(event) => {
              setNext(event.target.value);
              setNextError(undefined);
            }}
          />
          <PasswordRules id="password-rules" value={next} />
          <TextField
            label="새 비밀번호 확인"
            type="password"
            autoComplete="new-password"
            placeholder="한 번 더 입력해 주세요"
            required
            maxLength={PASSWORD_MAX_LENGTH}
            value={confirm}
            error={confirmError}
            onChange={(event) => setConfirm(event.target.value)}
          />
          <Button
            type="submit"
            inactive={!ready || submitting}
            aria-describedby="password-change-guide"
            className="w-full"
          >
            비밀번호 바꾸기
          </Button>
          {first ? (
            <p
              id="password-change-guide"
              className="typo-caption w-full text-center text-(--color-text-secondary)"
            >
              {/* 못 누르는 버튼은 이유를 읽어 준다 (A11Y 공통 규칙) — 화면에는 Figma 문구만 보인다 */}
              {!ready && <span className="sr-only">{remainingGuide}</span>}
              바꾸기 전에는 다른 화면을 쓸 수 없어요
            </p>
          ) : (
            <p id="password-change-guide" className="sr-only">
              {remainingGuide}
            </p>
          )}
        </form>
      </Block>
    </PageShell>
  );
}
