'use client';

import { Button, Notice } from '@hankki/ui';
import type { Ref } from 'react';
import { parseLocalDateTime } from '@/lib/format/datetime';
import { formatRelativeTime } from '@/lib/format/relative-time';
import type { AppNotification } from './types';
import type { NotificationListState } from './useNotifications';

type NotificationPanelProps = {
  id: string;
  headingRef?: Ref<HTMLHeadingElement>;
  list: NotificationListState;
  // 상대 시각의 기준
  now: Date;
  markingAll: boolean;
  loadingMore: boolean;
  actionError: string | null;
  onReadAll: () => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onSelect: (item: AppNotification) => void;
};

/**
 * F-08 알림 패널 (Figma 10 목업 장애학생 207:2111 · 도우미 209:3939): 제목·모두 읽음 → 알림 목록.
 * 비모달이라(명세 §2.3) 포커스를 가두지 않는다. 열고 닫기·포커스는 NotificationTopBar가 맡는다.
 */
export function NotificationPanel({
  id,
  headingRef,
  list,
  now,
  markingAll,
  loadingMore,
  actionError,
  onReadAll,
  onRetry,
  onLoadMore,
  onSelect,
}: NotificationPanelProps) {
  const headingId = `${id}-heading`;
  const readAllReasonId = `${id}-read-all-reason`;
  const hasUnread = list.status === 'ready' && list.items.some((item) => !item.read);
  const readAllInactive = !hasUnread || markingAll;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="relative max-h-[75dvh] w-full overflow-y-auto rounded-b-(--radius-xl) bg-(--color-bg-default) pb-2 shadow-(--shadow-modal)"
    >
      <div className="flex items-center justify-between gap-(--space-xs) px-5 pt-4 pb-2">
        <h2
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="typo-title text-(--color-text-primary)"
        >
          알림
        </h2>
        <Button
          variant="tertiary"
          size="small"
          inactive={readAllInactive}
          aria-describedby={hasUnread ? undefined : readAllReasonId}
          onClick={onReadAll}
          // 목업은 글자 버튼(caption-strong · text/brand). tertiary 기본 글자색보다 앞서도록 !를 붙인다
          className={`typo-caption-strong ${readAllInactive ? '' : 'text-(--color-text-brand)!'}`}
        >
          모두 읽음
        </Button>
        {!hasUnread && (
          <p id={readAllReasonId} className="sr-only">
            안 읽은 알림이 없어요
          </p>
        )}
      </div>

      {actionError && (
        <div className="px-5 pb-2">
          <Notice type="error" message={actionError} />
        </div>
      )}

      {list.status === 'loading' && (
        <p className="typo-body border-t border-(--color-border-default) px-5 py-3.5 text-(--color-text-secondary)">
          알림을 불러오고 있어요
        </p>
      )}

      {list.status === 'error' && (
        <div className="flex flex-col gap-(--space-sm) border-t border-(--color-border-default) px-5 py-3.5">
          <Notice type="error" message="알림을 불러오지 못했어요" />
          <Button variant="secondary" onClick={onRetry} className="w-full">
            다시 시도
          </Button>
        </div>
      )}

      {list.status === 'ready' && list.items.length === 0 && (
        <p className="typo-body border-t border-(--color-border-default) px-5 py-3.5 text-(--color-text-secondary)">
          새 알림이 없어요
        </p>
      )}

      {list.status === 'ready' && list.items.length > 0 && (
        <ul className="flex w-full flex-col">
          {list.items.map((item) => {
            const time = formatRelativeTime(parseLocalDateTime(item.createdAt), now);
            return (
              <li key={item.id} className="border-t border-(--color-border-default)">
                {/* 이름을 쉼표로 이어 준다 — 줄로 나뉜 문장·시각이 붙어 읽히지 않게, 읽음 여부는 색 대신 글자로 */}
                <button
                  type="button"
                  aria-label={`${item.read ? '' : '안 읽음, '}${item.message}, ${time}`}
                  onClick={() => onSelect(item)}
                  className="flex min-h-(--control-height) w-full cursor-pointer items-start gap-2.5 px-5 py-3.5 text-left active:bg-(--color-bg-muted)"
                >
                  {/* 점은 첫 줄 가운데에 맞춘다 */}
                  <span aria-hidden className="typo-body flex h-[1lh] shrink-0 items-center">
                    <span
                      className={`size-2 rounded-full ${item.read ? 'bg-(--color-border-default)' : 'bg-(--color-bg-brand-strong)'}`}
                    />
                  </span>
                  <span className="flex min-w-px flex-1 flex-col gap-0.5">
                    <span
                      className={`${item.read ? 'typo-body' : 'typo-body-strong'} text-(--color-text-primary)`}
                    >
                      {item.message}
                    </span>
                    <span className="typo-caption text-(--color-text-secondary)">{time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {list.status === 'ready' && list.nextCursor !== null && (
        <div className="border-t border-(--color-border-default) px-5 pt-2">
          <Button
            variant="secondary"
            size="small"
            inactive={loadingMore}
            onClick={onLoadMore}
            className="w-full"
          >
            이전 알림 더 보기
          </Button>
        </div>
      )}
    </section>
  );
}
