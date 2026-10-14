'use client';

import { Block, Button, ButtonLink, Notice } from '@hankki/ui';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { StudentTabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { CreateRequestDone } from '@/features/requests/create/CreateRequestDone';
import { CreateRequestForm } from '@/features/requests/create/CreateRequestForm';
import { useCreateRequestForm } from '@/features/requests/create/useCreateRequestForm';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// F-01 도우미 신청 — 입력 206:1435 · 완료 206:1648
export default function CreateRequestPage() {
  const me = useSessionGuard('STUDENT');
  const {
    options,
    form,
    submitting,
    error,
    otherHelpTextError,
    created,
    selectDate,
    selectTime,
    toggleHelpType,
    changeOtherHelpText,
    changeMemo,
    submit,
    reset,
    reloadOptions,
  } = useCreateRequestForm(me !== null);

  if (!me) return null;

  return (
    <PageShell
      size="L"
      topBar={<TopBar title="도우미 신청" logo bell />}
      footer={<Footer />}
      tabBar={<StudentTabBar active="/requests/new" />}
    >
      {created ? (
        <CreateRequestDone request={created} onCreateAnother={reset} />
      ) : options.status === 'error' ? (
        <Block gap="md">
          <Notice tone="error">{options.message}</Notice>
          <Button variant="secondary" onClick={() => void reloadOptions()} className="w-full">
            다시 시도
          </Button>
        </Block>
      ) : options.status === 'ready' && options.dates.length === 0 ? (
        // 7일 안에 고를 수 있는 시각이 없을 때 (연휴 등)
        <Block gap="md">
          <Notice tone="info">지금은 신청할 수 있는 시각이 없어요</Notice>
          <ButtonLink href="/requests" variant="secondary" className="w-full">
            내 신청 보기
          </ButtonLink>
        </Block>
      ) : options.status === 'ready' ? (
        <div className="flex w-full flex-col gap-2.5">
          <CreateRequestForm
            dates={options.dates}
            upcoming={options.upcoming}
            state={form}
            now={new Date()}
            submitting={submitting}
            error={error}
            otherHelpTextError={otherHelpTextError}
            onSelectDate={selectDate}
            onSelectTime={selectTime}
            onToggleHelpType={toggleHelpType}
            onChangeOtherHelpText={changeOtherHelpText}
            onChangeMemo={changeMemo}
            onSubmit={() => void submit()}
          />
        </div>
      ) : null}
    </PageShell>
  );
}
