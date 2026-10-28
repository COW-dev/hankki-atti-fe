import { StatusTag } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import Link from 'next/link';
import type { Ref } from 'react';
import { formatDotDate, parseLocalDateTime } from '@/lib/format/datetime';
import type { NoticeSummary } from './types';

// F-03 공지 목록 한 줄 (Figma 207:2207): 고정 태그 → 제목 → 게시일, 오른쪽 화살표. 줄 전체가 상세 링크
export function NoticeRow({
  notice,
  linkRef,
}: {
  notice: NoticeSummary;
  linkRef?: Ref<HTMLAnchorElement>;
}) {
  const date = formatDotDate(parseLocalDateTime(notice.publishedAt));

  return (
    <li className="w-full border-t border-(--color-border-default) first:border-t-0">
      {/* 태그·제목·날짜가 줄로 나뉘어 붙어 읽히지 않게 이름을 쉼표로 잇는다 */}
      <Link
        ref={linkRef}
        href={`/notices/${notice.noticeId}`}
        aria-label={`${notice.pinned ? '고정, ' : ''}${notice.title}, ${date}`}
        className="flex min-h-(--control-height) w-full items-center gap-(--space-sm) py-4"
      >
        <span className="flex min-w-px flex-1 flex-col items-start gap-1.5">
          {notice.pinned && <StatusTag type="info">고정</StatusTag>}
          <span className="typo-body-strong text-(--color-text-primary)">{notice.title}</span>
          <span className="typo-caption text-(--color-text-secondary)">{date}</span>
        </span>
        <Icon name="chevron-right" />
      </Link>
    </li>
  );
}
