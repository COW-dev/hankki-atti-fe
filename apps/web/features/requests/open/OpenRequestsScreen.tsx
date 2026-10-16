'use client';

import { useMemo, useState } from 'react';
import { Block, Button, Notice } from '@hankki/ui';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { HelperTabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { ApplyConfirmModal } from './ApplyConfirmModal';
import { ApplyResultModal } from './ApplyResultModal';
import { dateFilterOptions, filterDates } from './date-filter';
import { OpenRequestsView } from './OpenRequestsView';
import { useOpenRequests } from './useOpenRequests';

/**
 * F-06 요청 목록 (Figma 208:3532) — 지원 확인 209:3459 · 결과 209:3514 / 209:3575.
 * 역할 확인은 /requests 라우트가 하고, 여기는 도우미로 확인된 뒤에만 그린다.
 */
export function OpenRequestsScreen() {
  // 날짜 필터·조회 범위의 기준 시각. 화면에 머무는 동안 고정한다
  const [now] = useState(() => new Date());
  const {
    list,
    filter,
    setFilter,
    reload,
    applyTarget,
    submitting,
    applyError,
    listError,
    result,
    openApply,
    closeApply,
    submitApply,
    closeResult,
  } = useOpenRequests(true, now);
  // 목록을 다시 받은 뒤 포커스를 보낼 때마다 올린다
  const [focusKey, setFocusKey] = useState(0);
  const filterOptions = useMemo(() => dateFilterOptions(now), [now]);
  const visibleDates = useMemo(
    () => (list.status === 'ready' ? filterDates(list.dates, filter, now) : []),
    [list, filter, now],
  );

  const handleCloseResult = () => {
    void closeResult().then(() => setFocusKey((key) => key + 1));
  };

  return (
    <PageShell
      size="M"
      topBar={<TopBar title="요청 목록" logo bell />}
      footer={<Footer />}
      tabBar={<HelperTabBar active="/requests" />}
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
        <OpenRequestsView
          dates={visibleDates}
          filter={filter}
          filterOptions={filterOptions}
          onChangeFilter={setFilter}
          error={listError}
          applyingId={submitting && applyTarget ? applyTarget.id : null}
          onApply={openApply}
          focusKey={focusKey}
        />
      )}

      <ApplyConfirmModal
        request={applyTarget}
        submitting={submitting}
        error={applyError}
        onClose={closeApply}
        onSubmit={() => void submitApply()}
      />
      <ApplyResultModal result={result} onClose={handleCloseResult} />
    </PageShell>
  );
}
