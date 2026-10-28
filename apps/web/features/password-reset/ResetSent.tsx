'use client';

import { Button, ButtonLink, ErrorNotice } from '@hankki/ui';
import { useState } from 'react';
import { requestPasswordReset } from './api';
import { ResetResult } from './ResetResult';

/**
 * L-03 보냄 (Figma 204:738). 계정 유무와 관계없이 같은 화면이다.
 * 다시 받기는 같은 아이디로 다시 요청한다 — 서버가 10분 안 재요청은 조용히 건너뛰므로 "보냈어요"라고 하지 않는다.
 */
export function ResetSent({ loginId }: { loginId: string }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    if (resending) return;
    setResending(true);
    setError(null);
    try {
      await requestPasswordReset(loginId);
      setResent((count) => count + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '잠시 후 다시 시도해 주세요');
    } finally {
      setResending(false);
    }
  };

  return (
    <ResetResult
      badge="done"
      title="메일을 확인해 주세요"
      description="등록된 이메일로 재설정 링크를 보냈어요"
      caption="링크는 30분 동안 한 번만 쓸 수 있어요"
      footnote={
        <>
          <p className="typo-caption w-full text-center text-(--color-text-secondary)">
            메일이 안 오면 센터(02-300-1529)로 문의해 주세요
          </p>
          <p role="status" className="sr-only">
            {resent > 0 && <span key={resent}>메일을 다시 요청했어요</span>}
          </p>
        </>
      }
    >
      {error && <ErrorNotice message={error} />}
      <ButtonLink href="/login" className="w-full">
        로그인으로 돌아가기
      </ButtonLink>
      <Button
        variant="secondary"
        inactive={resending}
        onClick={() => void resend()}
        className="w-full"
      >
        메일 다시 받기
      </Button>
    </ResetResult>
  );
}
