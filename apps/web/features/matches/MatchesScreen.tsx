'use client';

import { Block, Button, Notice } from '@hankki/ui';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { HelperTabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { CancelMatchModal } from './CancelMatchModal';
import { LeaveWaitingModal } from './LeaveWaitingModal';
import { MatchesView } from './MatchesView';
import { PromotionModal } from './PromotionModal';
import { useMyApplications } from './useMyApplications';

/**
 * F-07 매칭 현황 (Figma 208:3143 빈 상태 · 208:3305 목록) — 취소 사유 209:3662 · 예비 승격 209:3766 · 예비 빠지기 209:3856.
 * 역할 확인은 /matches 라우트가 하고, 여기는 도우미로 확인된 뒤에만 그린다.
 */
export function MatchesScreen() {
  const {
    list,
    filter,
    setFilter,
    reload,
    target,
    open,
    close,
    submitting,
    actionError,
    listError,
    notice,
    refreshKey,
    submitCancel,
    submitLeave,
    submitAccept,
    submitDecline,
  } = useMyApplications(true);
  const targetOf = (action: 'cancel' | 'leave' | 'promotion') =>
    target?.action === action ? target.application : null;
  const cancelTarget = targetOf('cancel');

  return (
    <PageShell
      size="M"
      topBar={<TopBar title="매칭 현황" logo bell />}
      footer={<Footer withTabBar />}
      tabBar={<HelperTabBar active="/matches" />}
    >
      {list.status === 'error' && (
        <Block gap="md">
          <Notice type="error" message={list.message} />
          <Button variant="secondary" onClick={() => void reload()} className="w-full">
            다시 시도
          </Button>
        </Block>
      )}

      {list.status === 'ready' && (
        <MatchesView
          data={list.data}
          filter={filter}
          onChangeFilter={setFilter}
          notice={notice}
          error={listError}
          busyId={submitting && target ? target.application.applicationId : null}
          onAction={open}
          focusKey={refreshKey}
        />
      )}

      {/* 대상이 바뀌면 고른 사유·기타 내용을 비운다 */}
      <CancelMatchModal
        key={cancelTarget?.applicationId ?? 'none'}
        application={cancelTarget}
        submitting={submitting}
        error={actionError}
        onClose={close}
        onSubmit={(body) => void submitCancel(body)}
      />
      <LeaveWaitingModal
        application={targetOf('leave')}
        submitting={submitting}
        error={actionError}
        onClose={close}
        onSubmit={() => void submitLeave()}
      />
      <PromotionModal
        application={targetOf('promotion')}
        submitting={submitting}
        error={actionError}
        onClose={close}
        onAccept={() => void submitAccept()}
        onDecline={() => void submitDecline()}
      />
    </PageShell>
  );
}
