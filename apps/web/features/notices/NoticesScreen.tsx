'use client';

import { Block, Button, Notice } from '@hankki/ui';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { HelperTabBar, StudentTabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { NoticeDetailView, NoticeUnavailable } from './NoticeDetailView';
import { NoticesView } from './NoticesView';
import { parseNoticeId, useNotice } from './useNotice';
import { useNotices } from './useNotices';

// 공지 화면은 장애학생(L)·도우미(M)가 같고 크기와 탭바만 다르다
export type NoticeReader = 'STUDENT' | 'HELPER';

function NoticeShell({
  reader,
  back,
  children,
}: {
  reader: NoticeReader;
  back?: boolean;
  children: ReactNode;
}) {
  return (
    <PageShell
      size={reader === 'STUDENT' ? 'L' : 'M'}
      topBar={<TopBar title="공지사항" logo={!back} back={back} bell />}
      footer={<Footer withTabBar />}
      tabBar={
        reader === 'STUDENT' ? (
          <StudentTabBar active="/notices" />
        ) : (
          <HelperTabBar active="/notices" />
        )
      }
    >
      {children}
    </PageShell>
  );
}

function LoadFailed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Block gap="md">
      <Notice type="error" message={message} />
      <Button variant="secondary" onClick={onRetry} className="w-full">
        다시 시도
      </Button>
    </Block>
  );
}

/** F-03 공지 목록 (U-24). 역할 확인은 라우트가 하고, 여기는 확인된 뒤에만 그린다. */
export function NoticesScreen({ reader }: { reader: NoticeReader }) {
  const { list, reload, hasMore, loadMore, loadingMore, moreError, loadedMore } = useNotices();

  return (
    <NoticeShell reader={reader}>
      {list.status === 'error' && (
        <LoadFailed message="공지를 불러오지 못했어요" onRetry={() => void reload()} />
      )}
      {list.status === 'ready' && (
        <NoticesView
          notices={list.notices}
          hasMore={hasMore}
          loadingMore={loadingMore}
          moreError={moreError}
          loadedMore={loadedMore}
          onLoadMore={() => void loadMore()}
        />
      )}
    </NoticeShell>
  );
}

/** F-03 공지 상세 (U-25). 공지 알림(명세 §2.3)도 이 화면으로 온다. */
export function NoticeDetailScreen({
  reader,
  noticeId,
}: {
  reader: NoticeReader;
  noticeId: string;
}) {
  const { state, reload } = useNotice(parseNoticeId(noticeId));

  return (
    <NoticeShell reader={reader} back>
      {state.status === 'ready' && <NoticeDetailView notice={state.notice} />}
      {(state.status === 'deleted' || state.status === 'notFound') && (
        <NoticeUnavailable reason={state.status} />
      )}
      {state.status === 'retry' && (
        <LoadFailed message="공지를 불러오지 못했어요" onRetry={() => void reload()} />
      )}
    </NoticeShell>
  );
}
