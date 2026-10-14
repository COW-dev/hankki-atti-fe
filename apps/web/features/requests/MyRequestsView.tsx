'use client';

import { useId, useState } from 'react';
import { Block, Button, ButtonLink, Notice } from '@hankki/ui';
import { PastRequestRow } from './PastRequestRow';
import { UpcomingRequestCard } from './UpcomingRequestCard';
import type { MyHelpRequest, MyHelpRequests } from './types';

// 지난 신청은 최근 3건만 보여 주고 "전체 보기"로 펼친다 (명세·Figma에 개수 없음, 2026-10-08 결정)
const PAST_PREVIEW_COUNT = 3;

/**
 * F-02 내 신청 · 목록 (Figma 204:2804). 데이터와 동작을 props로 받아 Storybook에서도 그릴 수 있다.
 */
export function MyRequestsView({
  data,
  now,
  notice,
  error,
  withdrawingId,
  onWithdraw,
  onReportNoShow,
}: {
  data: MyHelpRequests;
  now: Date;
  // 철회·신고 완료 안내 (polite)
  notice: string | null;
  // 철회 실패 등 블록 안 오류 안내
  error: string | null;
  withdrawingId: number | null;
  onWithdraw: (request: MyHelpRequest) => void;
  onReportNoShow: (request: MyHelpRequest) => void;
}) {
  const [pastExpanded, setPastExpanded] = useState(false);
  const pastListId = useId();
  const visiblePast = pastExpanded ? data.past : data.past.slice(0, PAST_PREVIEW_COUNT);
  const canExpandPast = data.past.length > PAST_PREVIEW_COUNT;

  return (
    <>
      <Block>
        <ButtonLink href="/requests/new" className="w-full">
          + 도우미 신청하기
        </ButtonLink>
      </Block>

      {notice && (
        <Block>
          <Notice tone="success" live>
            {notice}
          </Notice>
        </Block>
      )}
      {error && (
        <Block>
          <Notice tone="error">{error}</Notice>
        </Block>
      )}

      {data.upcoming.length > 0 && (
        <Block gap="md">
          <div className="flex w-full items-center justify-between pb-1">
            <h2 className="typo-label text-(--color-text-primary)">다가오는 신청</h2>
            <p className="typo-caption text-(--color-text-secondary)">{data.upcoming.length}건</p>
          </div>
          <ul className="flex w-full flex-col">
            {data.upcoming.map((request, index) => (
              <UpcomingRequestCard
                key={request.id}
                request={request}
                isNext={index === 0}
                now={now}
                withdrawing={withdrawingId === request.id}
                onWithdraw={onWithdraw}
              />
            ))}
          </ul>
        </Block>
      )}

      {data.past.length > 0 && (
        <Block gap="md">
          <div className="flex w-full items-center justify-between pb-1">
            <h2 className="typo-label text-(--color-text-primary)">지난 신청</h2>
            {canExpandPast && (
              <Button
                variant="tertiary"
                size="small"
                aria-expanded={pastExpanded}
                aria-controls={pastListId}
                onClick={() => setPastExpanded((expanded) => !expanded)}
                className="typo-caption-strong text-(--color-text-brand)"
              >
                {pastExpanded ? '접기' : '전체 보기'}
              </Button>
            )}
          </div>
          <ul id={pastListId} className="flex w-full flex-col">
            {visiblePast.map((request) => (
              <PastRequestRow key={request.id} request={request} onReportNoShow={onReportNoShow} />
            ))}
          </ul>
          {canExpandPast && (
            <p role="status" className="sr-only">
              {pastExpanded ? `지난 신청 ${data.past.length}건 표시` : ''}
            </p>
          )}
        </Block>
      )}
    </>
  );
}
