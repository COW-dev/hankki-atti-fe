import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { parseLocalDateTime } from '@/lib/format/datetime';
import type { OpenHelpRequest } from '../types';
import { dateFilterOptions, filterDates, type DateFilter } from './date-filter';
import { OpenRequestsView } from './OpenRequestsView';

const NOW = parseLocalDateTime('2026-10-16T09:00:00');

function request(partial: Partial<OpenHelpRequest> & Pick<OpenHelpRequest, 'id'>) {
  return {
    startAt: '2026-10-16T12:00:00',
    endAt: '2026-10-16T13:00:00',
    helpTypes: ['SERVING', 'SEATING'],
    applyOutcome: 'MATCH',
    blockReason: null,
    ...partial,
  } satisfies OpenHelpRequest;
}

// 목업 208:3532의 세 카드(바로 매칭 · 예비 등록 · 지원 불가) + 다른 날짜 한 건
const ALL_DATES = [
  {
    date: '2026-10-16',
    requests: [
      request({ id: 1 }),
      request({
        id: 2,
        startAt: '2026-10-16T18:00:00',
        endAt: '2026-10-16T19:00:00',
        helpTypes: ['MOVING'],
        applyOutcome: 'WAITING',
      }),
      request({
        id: 3,
        startAt: '2026-10-16T12:30:00',
        endAt: '2026-10-16T13:30:00',
        applyOutcome: 'BLOCKED',
        blockReason: 'TIME_OVERLAP',
      }),
    ],
  },
  {
    date: '2026-10-18',
    requests: [request({ id: 4, startAt: '2026-10-18T12:00:00', endAt: '2026-10-18T13:00:00' })],
  },
];

const meta = {
  title: '화면/F-06 요청 목록',
  component: OpenRequestsView,
  args: {
    dates: filterDates(ALL_DATES, 'today', NOW),
    filter: 'today',
    filterOptions: dateFilterOptions(NOW),
    onChangeFilter: fn(),
    error: null,
    applyingId: null,
    onApply: fn(),
  },
  // 필터를 실제로 바꿔 볼 수 있게 선택값은 스토리에서 관리한다
  render: function Example(args) {
    const [filter, setFilter] = useState<DateFilter>(args.filter);
    return (
      <OpenRequestsView
        {...args}
        filter={filter}
        dates={filterDates(ALL_DATES, filter, NOW)}
        onChangeFilter={(next) => {
          setFilter(next);
          args.onChangeFilter(next);
        }}
      />
    );
  },
  decorators: [
    (Story) => (
      <div data-size="M" className="flex w-[390px] flex-col gap-2.5 bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OpenRequestsView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('radiogroup', { name: '날짜' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: '10월 16일 (금)' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    // 지원 불가 카드는 숨기지 않고 사유를 보여 준다 — 버튼은 두 개뿐
    await expect(canvas.getByText('같은 시간에 매칭된 일정이 있어요')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '10월 16일 (금) 12:00 지원하기' }));
    await expect(args.onApply).toHaveBeenCalledOnce();
    await expect(
      canvas.getByRole('button', { name: '10월 16일 (금) 18:00 예비로 지원' }),
    ).toBeInTheDocument();
    // 이번 주로 바꾸면 날짜 섹션이 둘
    await userEvent.click(canvas.getByRole('radio', { name: '이번 주' }));
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    await expect(canvas.getByRole('status')).toHaveTextContent('4건 표시');
  },
};
export const Empty: Story = {
  args: { filter: 'tomorrow' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '이날은 아직 신청이 없어요' })).toBeVisible();
  },
};
export const WithError: Story = {
  args: { error: '예비 인원이 다 찼어요. 목록을 다시 불러올게요' },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
