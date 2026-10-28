import { Block, ButtonLink, Notice, StatusTag } from '@hankki/ui';
import { useId } from 'react';
import { formatDotDate, formatDotMonthDay, parseLocalDateTime } from '@/lib/format/datetime';
import { NOTICE_TARGET_LABEL } from '@/lib/labels/notice';
import { splitNoticeBody } from './notice-body';
import type { NoticeDetail } from './types';

// "2026.09.28 · 수정됨 09.29 · 대상: 도우미" (명세 F-03 "게시일 · (수정됨 날짜) · 대상", Figma 209:4138)
function noticeMeta(notice: NoticeDetail): string {
  return [
    formatDotDate(parseLocalDateTime(notice.publishedAt)),
    notice.editedAt && `수정됨 ${formatDotMonthDay(parseLocalDateTime(notice.editedAt))}`,
    `대상: ${NOTICE_TARGET_LABEL[notice.target]}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

/**
 * F-03 공지 상세 (Figma 장애학생 207:2304 · 도우미 209:4138): 고정 태그 → 제목 → 게시 정보 → 구분선 → 본문.
 * 본문은 일반 텍스트라 줄바꿈을 살리고 URL만 새 창 링크로 바꾼다. 화면의 h1은 상단 바 "공지사항"이라 제목은 h2.
 */
export function NoticeDetailView({ notice }: { notice: NoticeDetail }) {
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      className="flex w-full flex-col items-start gap-2.5 bg-(--color-bg-default) px-5 py-5.5"
    >
      {notice.pinned && <StatusTag type="info">고정</StatusTag>}
      <h2 id={titleId} className="typo-title text-(--color-text-primary)">
        {notice.title}
      </h2>
      <p className="typo-caption text-(--color-text-secondary)">{noticeMeta(notice)}</p>
      <hr className="w-full border-(--color-border-default)" />
      <p className="typo-body mt-0.5 w-full break-words whitespace-pre-wrap text-(--color-text-primary)">
        {splitNoticeBody(notice.body).map((segment, index) =>
          segment.type === 'text' ? (
            segment.text
          ) : (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="typo-body-strong break-all text-(--color-text-brand) underline"
            >
              {segment.href} (새 창)
            </a>
          ),
        )}
      </p>
    </article>
  );
}

const UNAVAILABLE_MESSAGE = {
  deleted: '삭제된 공지예요',
  notFound: '공지를 찾을 수 없어요',
} as const;

// 삭제된 공지(명세 F-03) · 없거나 내 대상이 아닌 공지. 이미 받은 알림으로 들어와도 같은 안내를 본다
export function NoticeUnavailable({ reason }: { reason: keyof typeof UNAVAILABLE_MESSAGE }) {
  return (
    <Block gap="md">
      <Notice type="info" message={UNAVAILABLE_MESSAGE[reason]} />
      <ButtonLink href="/notices" variant="secondary" className="w-full">
        목록으로
      </ButtonLink>
    </Block>
  );
}
