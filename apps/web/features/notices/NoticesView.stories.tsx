import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { NoticesView } from './NoticesView';
import type { NoticeSummary } from './types';

// 목업 207:2140의 세 건: 고정 1 + 일반 2
const NOTICES: NoticeSummary[] = [
  {
    noticeId: 3,
    title: '10월 학식당 운영 시간 안내',
    pinned: true,
    publishedAt: '2026-10-01T09:00:00',
  },
  {
    noticeId: 2,
    title: '도우미 신청 방법이 바뀌었어요',
    pinned: false,
    publishedAt: '2026-09-28T10:00:00',
  },
  { noticeId: 1, title: '서비스 이용 안내', pinned: false, publishedAt: '2026-09-24T10:00:00' },
];

const meta = {
  title: '공지/NoticesView',
  component: NoticesView,
  args: {
    notices: NOTICES,
    hasMore: false,
    loadingMore: false,
    moreError: null,
    loadedMore: null,
    onLoadMore: fn(),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div data-size="L" className="mx-auto max-w-[480px] bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoticesView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // 고정 태그·제목·날짜를 쉼표로 이어 한 링크로 읽는다
    await expect(
      canvas.getByRole('link', { name: '고정, 10월 학식당 운영 시간 안내, 2026.10.01' }),
    ).toHaveAttribute('href', '/notices/3');
    await expect(canvas.queryByRole('button', { name: '더 보기' })).not.toBeInTheDocument();
  },
};

export const HasMore: Story = {
  args: { hasMore: true },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '더 보기' }));
    await expect(args.onLoadMore).toHaveBeenCalledOnce();
  },
};

export const LoadingMore: Story = {
  args: { hasMore: true, loadingMore: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '더 보기' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const MoreFailed: Story = {
  args: { hasMore: true, moreError: '공지를 더 불러오지 못했어요. 다시 시도해 주세요' },
};

export const LoadedMore: Story = {
  args: { loadedMore: { firstId: 2, count: 2, key: 1 } },
  play: async ({ canvas }) => {
    // 새로 붙은 첫 공지로 포커스를 옮기고 개수를 알린다
    await expect(
      canvas.getByRole('link', { name: '도우미 신청 방법이 바뀌었어요, 2026.09.28' }),
    ).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('공지 2개를 더 불러왔어요');
  },
};

export const Empty: Story = { args: { notices: [] } };

export const Helper: Story = {
  decorators: [
    (Story) => (
      <div data-size="M" className="mx-auto max-w-[480px] bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
};

export const LargeText: Story = { globals: { textSize: 'large' } };
