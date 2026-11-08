'use client';

import { Block, Button, ButtonLink, ErrorNotice } from '@hankki/ui';
import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { TopBar } from '@/components/layout/TopBar';
import { BackToLogin } from './BackToLogin';
import { NewPasswordForm } from './NewPasswordForm';
import { readResetToken } from './reset-link';
import { ResetRequestForm } from './ResetRequestForm';
import { ResetResult } from './ResetResult';
import { ResetSent } from './ResetSent';
import { useResetLink } from './useResetLink';

function subscribeHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function ResetShell({
  title,
  back = true,
  children,
}: {
  title: string;
  back?: boolean;
  children: ReactNode;
}) {
  return (
    <PageShell size="L" topBar={<TopBar title={title} back={back} />} footer={<Footer copyright />}>
      {children}
    </PageShell>
  );
}

/**
 * L-03 비밀번호 재설정 (U-22·U-23). 주소에 `#token=`이 있으면 메일 링크 흐름, 없으면 요청 흐름.
 * 해시는 브라우저에만 있으므로 서버 렌더링 때는 아무것도 그리지 않는다.
 */
export function PasswordResetScreen() {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => null,
  );
  const [requestAgain, setRequestAgain] = useState(false);

  if (hash === null) return null;
  const token = readResetToken(hash);
  if (token && !requestAgain) {
    return (
      // 다른 링크를 열면 이전 링크의 확인 결과가 남지 않게 새로 그린다
      <ResetLinkFlow
        key={token}
        token={token}
        onRequestAgain={() => {
          // 다 쓴 토큰을 주소에 남기지 않는다
          window.history.replaceState(null, '', window.location.pathname);
          setRequestAgain(true);
        }}
      />
    );
  }
  return <ResetRequestFlow />;
}

function ResetRequestFlow() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <ResetShell title="비밀번호 재설정">
      {sentTo === null ? <ResetRequestForm onSent={setSentTo} /> : <ResetSent loginId={sentTo} />}
    </ResetShell>
  );
}

function ResetLinkFlow({ token, onRequestAgain }: { token: string; onRequestAgain: () => void }) {
  const { status, retry, submit, submitting, passwordError, notice } = useResetLink(token);

  if (status === 'done') {
    return (
      <ResetShell title="비밀번호 재설정" back={false}>
        <ResetResult
          badge="done"
          title="비밀번호를 바꿨어요"
          description="새 비밀번호로 로그인해 주세요"
          caption="다른 기기에서는 로그아웃됐어요"
        >
          <ButtonLink href="/login" className="w-full">
            로그인하러 가기
          </ButtonLink>
        </ResetResult>
      </ResetShell>
    );
  }

  if (status === 'expired') {
    return (
      <ResetShell title="비밀번호 재설정">
        <ResetResult
          badge="warning"
          title="링크가 만료됐어요"
          description="링크는 30분 동안 한 번만 쓸 수 있어요"
          footnote={<BackToLogin />}
        >
          <Button onClick={onRequestAgain} className="w-full">
            다시 요청하기
          </Button>
        </ResetResult>
      </ResetShell>
    );
  }

  return (
    <ResetShell title="새 비밀번호">
      {status === 'checking' && (
        <Block>
          <p className="typo-body text-(--color-text-secondary)">링크를 확인하고 있어요</p>
        </Block>
      )}
      {status === 'error' && (
        <Block gap="md">
          <ErrorNotice message="링크를 확인하지 못했어요. 잠시 후 다시 시도해 주세요" />
          <Button variant="secondary" onClick={retry} className="w-full">
            다시 시도
          </Button>
        </Block>
      )}
      {status === 'ready' && (
        <NewPasswordForm
          submitting={submitting}
          passwordError={passwordError}
          notice={notice}
          onSubmit={(newPassword) => void submit(newPassword)}
        />
      )}
    </ResetShell>
  );
}
