'use client';

import { Block, Button, Notice } from '@hankki/ui';
import { useEffect, useRef } from 'react';
import { NoticeRow } from './NoticeRow';
import type { NoticeSummary } from './types';
import type { LoadedMore } from './useNotices';

/**
 * F-03 공지 목록 (Figma 장애학생 207:2140 · 도우미 209:3974): 흰 블록 하나에 공지 목록, 아래 [더 보기].
 * 더 보기로 받은 뒤에는 새로 붙은 첫 공지로 포커스를 옮기고 개수를 polite로 알린다.
 */
export function NoticesView({
  notices,
  hasMore,
  loadingMore,
  moreError,
  loadedMore,
  onLoadMore,
}: {
  notices: NoticeSummary[];
  hasMore: boolean;
  loadingMore: boolean;
  moreError: string | null;
  loadedMore: LoadedMore | null;
  onLoadMore: () => void;
}) {
  const links = useRef(new Map<number, HTMLAnchorElement>());

  useEffect(() => {
    if (loadedMore?.firstId == null) return;
    links.current.get(loadedMore.firstId)?.focus();
  }, [loadedMore]);

  if (notices.length === 0) {
    return (
      <Block>
        <p className="typo-body text-(--color-text-secondary)">아직 공지가 없어요</p>
      </Block>
    );
  }

  return (
    <section className="flex w-full flex-col bg-(--color-bg-default) px-5 py-2">
      <ul className="flex w-full flex-col">
        {notices.map((notice) => (
          <NoticeRow
            key={notice.noticeId}
            notice={notice}
            linkRef={(element) => {
              if (element) links.current.set(notice.noticeId, element);
              else links.current.delete(notice.noticeId);
            }}
          />
        ))}
      </ul>
      {moreError && (
        <div className="pb-2">
          <Notice type="error" message={moreError} />
        </div>
      )}
      {hasMore && (
        <div className="pt-2 pb-3">
          <Button
            variant="secondary"
            inactive={loadingMore}
            onClick={onLoadMore}
            className="w-full"
          >
            더 보기
          </Button>
        </div>
      )}
      <p role="status" className="sr-only">
        {loadedMore && (
          <span key={loadedMore.key}>
            {loadedMore.count > 0
              ? `공지 ${loadedMore.count}개를 더 불러왔어요`
              : '더 불러올 공지가 없어요'}
          </span>
        )}
      </p>
    </section>
  );
}
