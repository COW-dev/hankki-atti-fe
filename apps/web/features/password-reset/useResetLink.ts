'use client';

import { useCallback, useEffect, useState } from 'react';
import { confirmPasswordReset, verifyPasswordReset } from './api';
import { resetFailure } from './reset-link';

// 메일 링크로 들어온 뒤: 확인 중 → 새 비밀번호 입력 → 완료, 언제든 만료로 갈 수 있다
export type ResetLinkStatus = 'checking' | 'ready' | 'expired' | 'error' | 'done';

function check(token: string): Promise<ResetLinkStatus> {
  return verifyPasswordReset(token).then(
    (): ResetLinkStatus => 'ready',
    (error: unknown): ResetLinkStatus => (resetFailure(error) === 'expired' ? 'expired' : 'error'),
  );
}

/** L-03 새 비밀번호 흐름 (U-23). 링크를 먼저 확인해 만료된 링크면 입력 전에 알린다. */
export function useResetLink(token: string) {
  const [status, setStatus] = useState<ResetLinkStatus>('checking');
  const [submitting, setSubmitting] = useState(false);
  // 새 비밀번호 칸 오류 (지금 비밀번호와 같음)
  const [passwordError, setPasswordError] = useState<string | undefined>();
  // 폼 위 오류 (다시 누를 수 있는 실패)
  const [notice, setNotice] = useState<string | null>(null);

  // setState는 then 콜백에서만 부른다 (effect 안 동기 setState 금지)
  useEffect(() => {
    void check(token).then(setStatus);
  }, [token]);

  const retry = useCallback(() => {
    setStatus('checking');
    void check(token).then(setStatus);
  }, [token]);

  const submit = useCallback(
    async (newPassword: string) => {
      if (submitting) return;
      setSubmitting(true);
      setPasswordError(undefined);
      setNotice(null);
      try {
        await confirmPasswordReset(token, newPassword);
        setStatus('done');
      } catch (error) {
        const failure = resetFailure(error);
        if (failure === 'expired') setStatus('expired');
        else if (failure === 'sameAsCurrent')
          setPasswordError('지금 쓰는 비밀번호와 다르게 만들어 주세요');
        else setNotice(error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요');
      } finally {
        setSubmitting(false);
      }
    },
    [token, submitting],
  );

  return { status, retry, submit, submitting, passwordError, notice };
}
