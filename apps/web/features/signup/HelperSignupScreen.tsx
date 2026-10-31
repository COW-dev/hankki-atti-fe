'use client';

import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { TopBar } from '@/components/layout/TopBar';
import { signupFailureOf, signupHelper, type SignupFailure } from './api';
import { GuideStep } from './GuideStep';
import { SIGNUP_GUIDES, type GuideType } from './guides';
import { InfoStep } from './InfoStep';
import { joinedSignup } from './joined';
import { EMPTY_SIGNUP_FORM, type SignupForm } from './signup-form';

// 2단계는 주소 해시(#info)로 둔다 — 뒤로 가기가 1단계로 돌아오고, 읽음 상태·입력값은 이 화면 state로 남는다.
// 입력값(비밀번호 포함)은 메모리에만 두고 주소·브라우저 저장소에 넣지 않는다
const INFO_HASH = '#info';

function subscribeHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/**
 * L-02 도우미 회원가입 (U-14·U-15). 크기 L (Figma 섹션 14:986 "가입은 L").
 * 안내 자료를 다 읽지 않으면 #info로 바로 들어와도 1단계를 보인다 (서버도 guideConfirmed를 요구한다).
 */
export function HelperSignupScreen() {
  const router = useRouter();
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => '',
  );
  const [read, setRead] = useState<ReadonlySet<GuideType>>(new Set());
  const [form, setForm] = useState(EMPTY_SIGNUP_FORM);
  // 2단계에서 뒤로 왔을 때만 1단계 제목으로 포커스한다 (처음 들어올 때는 h1)
  const [returned, setReturned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<SignupFailure | null>(null);

  const allRead = read.size === SIGNUP_GUIDES.length;
  const onInfo = hash === INFO_HASH && allRead;

  const toggleRead = (type: GuideType) =>
    setRead((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  const submit = async (form: SignupForm) => {
    setSubmitting(true);
    setFailure(null);
    try {
      await signupHelper(form);
      joinedSignup.set(form.email.trim().toLowerCase());
      router.replace('/login');
    } catch (error) {
      setFailure(signupFailureOf(error));
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      size="L"
      topBar={<TopBar title="도우미 회원가입" back />}
      footer={<Footer copyright />}
    >
      {onInfo ? (
        <InfoStep
          form={form}
          setForm={setForm}
          submitting={submitting}
          failure={failure}
          onSubmit={submit}
        />
      ) : (
        <GuideStep
          read={read}
          onToggleRead={toggleRead}
          focusTitle={returned}
          onNext={() => {
            setReturned(true);
            window.location.hash = INFO_HASH;
          }}
        />
      )}
    </PageShell>
  );
}
