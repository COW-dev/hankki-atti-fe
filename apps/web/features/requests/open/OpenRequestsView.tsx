'use client';

import { useEffect, useId, useRef } from 'react';
import { Block, ChipGroup, Notice, type ChipOption } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { formatDate, parseLocalDate } from '@/lib/format/datetime';
import type { OpenHelpRequest, OpenHelpRequestDate } from '../types';
import { countRequests, type DateFilter } from './date-filter';
import { OpenRequestCard } from './OpenRequestCard';

/**
 * F-06 요청 목록 (Figma 208:3532): 날짜 필터 블록 → 날짜별 카드 블록. 데이터와 동작을 props로 받아 Storybook에서도 그린다.
 * dates는 필터를 거친 뒤의 날짜 그룹이다 (빈 그룹 없음).
 */
export function OpenRequestsView({
  dates,
  filter,
  filterOptions,
  onChangeFilter,
  error,
  applyingId,
  onApply,
  focusKey = 0,
}: {
  dates: OpenHelpRequestDate[];
  filter: DateFilter;
  filterOptions: ChipOption<DateFilter>[];
  onChangeFilter: (filter: DateFilter) => void;
  // 지원 실패로 목록을 다시 받은 뒤 보여 주는 사유 (assertive)
  error: string | null;
  applyingId: number | null;
  onApply: (request: OpenHelpRequest) => void;
  // 목록을 다시 받은 뒤 포커스를 목록 제목으로 보낸다 (눌렀던 버튼이 사라질 수 있어서). 값이 바뀔 때마다
  focusKey?: number;
}) {
  const filterLabelId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const count = countRequests(dates);

  useEffect(() => {
    if (focusKey > 0) headingRef.current?.focus();
  }, [focusKey]);

  return (
    <>
      {/* 날짜 필터 + 안내 (208:3598 · 208:3609) */}
      <Block gap="md">
        <p id={filterLabelId} className="sr-only">
          날짜
        </p>
        {/* 목업은 한 줄 4개지만 "내일 10/17"·큰 글씨에서 칩 안 글자가 줄바꿈돼 2열로 둔다 (계획 접근성 항목) */}
        <ChipGroup
          labelledBy={filterLabelId}
          options={filterOptions}
          value={filter}
          onChange={onChangeFilter}
          columns={2}
        />
        <p className="typo-caption flex w-full items-center gap-1.5 text-(--color-text-secondary)">
          <Icon name="info" size="calc(var(--font-caption) * 14 / 13)" />
          먼저 지원한 도우미가 바로 매칭돼요
        </p>
        {/* 필터를 바꾸면 결과 수를 조용히 읽어 준다 */}
        <p role="status" className="sr-only">
          {count}건 표시
        </p>
      </Block>

      {error && (
        <Block>
          <Notice type="error" message={error} />
        </Block>
      )}

      {dates.length === 0 ? (
        // 빈 상태 — 목업 프레임 없음, 내 신청 빈 상태(206:1281) 모양을 따른다
        <Block>
          <div className="flex w-full flex-col items-center gap-2.5 pt-6 pb-2">
            <div className="flex size-14 items-center justify-center rounded-full bg-(--color-bg-muted)">
              <Icon name="list" />
            </div>
            <div className="h-0.5" />
            <h2 ref={headingRef} tabIndex={-1} className="typo-title w-full text-center">
              {filter === 'week' ? '이번 주에는 아직 신청이 없어요' : '이날은 아직 신청이 없어요'}
            </h2>
            <p className="typo-body w-full text-center text-(--color-text-secondary)">
              다른 날짜를 골라 보세요
            </p>
          </div>
        </Block>
      ) : (
        dates.map((group, index) => (
          // 날짜 섹션 (208:3615): 제목 + N건 → 카드 목록
          <Block key={group.date}>
            <div className="flex w-full items-center justify-between pb-1">
              <h2
                ref={index === 0 ? headingRef : undefined}
                tabIndex={-1}
                className="typo-label text-(--color-text-primary)"
              >
                {formatDate(parseLocalDate(group.date))}
              </h2>
              <p className="typo-caption text-(--color-text-secondary)">
                {group.requests.length}건
              </p>
            </div>
            <ul className="flex w-full flex-col">
              {group.requests.map((request) => (
                <OpenRequestCard
                  key={request.id}
                  request={request}
                  applying={applyingId === request.id}
                  onApply={onApply}
                />
              ))}
            </ul>
          </Block>
        ))
      )}
    </>
  );
}
