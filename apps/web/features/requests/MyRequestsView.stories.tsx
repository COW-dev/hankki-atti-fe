import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { MyRequestsView } from './MyRequestsView';
import type { MyHelpRequest } from './types';

function request(partial: Partial<MyHelpRequest> & Pick<MyHelpRequest, 'id' | 'status'>) {
  return {
    startAt: '2026-10-12T12:00:00',
    endAt: '2026-10-12T13:00:00',
    helpTypes: ['SERVING', 'SEATING'],
    otherHelpText: null,
    memo: null,
    helper: null,
    helperChanged: false,
    noShowReportable: false,
    noShowDeadline: null,
    ...partial,
  } satisfies MyHelpRequest;
}

const NOW = new Date(2026, 9, 12, 9, 0);

const meta = {
  title: '화면/F-02 내 신청',
  component: MyRequestsView,
  args: {
    now: NOW,
    notice: null,
    error: null,
    withdrawingId: null,
    onWithdraw: fn(),
    onReportNoShow: fn(),
    data: {
      upcoming: [
        request({
          id: 1,
          status: 'RECRUITING',
          startAt: '2026-10-12T17:00:00',
          endAt: '2026-10-12T18:00:00',
          helpTypes: ['SERVING', 'MOVING'],
        }),
        request({
          id: 2,
          status: 'MATCHED',
          startAt: '2026-10-13T12:00:00',
          endAt: '2026-10-13T13:00:00',
          helper: { name: '이도움', kakaoId: 'dowoom_lee' },
        }),
      ],
      past: [
        request({
          id: 3,
          status: 'COMPLETED',
          startAt: '2026-10-08T12:30:00',
          endAt: '2026-10-08T13:30:00',
          helper: { name: '김도움', kakaoId: 'kim' },
          noShowReportable: true,
          noShowDeadline: '2026-10-09T13:30:00',
        }),
        request({
          id: 4,
          status: 'FAILED',
          startAt: '2026-10-07T17:00:00',
          endAt: '2026-10-07T18:00:00',
        }),
        request({
          id: 5,
          status: 'CANCELED',
          startAt: '2026-10-06T12:00:00',
          endAt: '2026-10-06T13:00:00',
        }),
        request({
          id: 6,
          status: 'NO_SHOW',
          startAt: '2026-10-05T12:00:00',
          endAt: '2026-10-05T13:00:00',
          helper: { name: '박도움', kakaoId: 'park' },
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div data-size="L" className="flex w-[390px] flex-col gap-2.5 bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyRequestsView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('heading', { name: '다가오는 신청' })).toBeInTheDocument();
    await expect(canvas.getByText('오늘 저녁 · 다음 식사')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '10월 12일 (월) 신청 철회' }));
    await expect(args.onWithdraw).toHaveBeenCalledOnce();
    // 지난 신청 3건 + 전체 보기
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5);
    await userEvent.click(canvas.getByRole('button', { name: '전체 보기' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(6);
    await expect(canvas.getByRole('button', { name: '접기' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};
export const WithNotice: Story = { args: { notice: '신청을 철회했어요', withdrawingId: 1 } };
export const WithError: Story = {
  args: { error: '이미 상태가 바뀐 신청이에요. 목록을 다시 불러올게요' },
};
export const HelperChanged: Story = {
  args: {
    data: {
      upcoming: [
        request({
          id: 2,
          status: 'MATCHED',
          startAt: '2026-10-13T12:00:00',
          endAt: '2026-10-13T13:00:00',
          helper: { name: '이도움', kakaoId: 'dowoom_lee' },
          helperChanged: true,
        }),
      ],
      past: [],
    },
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
