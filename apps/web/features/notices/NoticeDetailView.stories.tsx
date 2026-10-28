import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { NoticeDetailView, NoticeUnavailable } from './NoticeDetailView';
import type { NoticeDetail } from './types';

// 목업 207:2304 본문 + 안내 링크
const NOTICE: NoticeDetail = {
  noticeId: 3,
  title: '10월 학식당 운영 시간 안내',
  body: '10월부터 학생식당 운영 시간이 바뀌어요.\n\n• 점심 11:30 ~ 14:00\n• 저녁 17:00 ~ 18:30\n• 주말 운영 없음\n\n도우미 신청 때 고르는 시작 시각도 이 시간에 맞춰져요.\n자세히 보기: https://www.mju.ac.kr/notice/3',
  target: 'ALL',
  pinned: true,
  publishedAt: '2026-10-01T09:00:00',
  editedAt: null,
};

const meta = {
  title: '공지/NoticeDetailView',
  component: NoticeDetailView,
  args: { notice: NOTICE },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div data-size="L" className="mx-auto max-w-[480px] bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoticeDetailView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('article', { name: '10월 학식당 운영 시간 안내' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('2026.10.01 · 대상: 전체')).toBeVisible();
    const link = canvas.getByRole('link', { name: 'https://www.mju.ac.kr/notice/3 (새 창)' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

// 목업 209:4138 (도우미 · 수정됨)
export const Edited: Story = {
  args: {
    notice: {
      ...NOTICE,
      title: '도우미 취소·패널티 기준 안내',
      body: '매칭 뒤 취소는 앱에서 바로 할 수 있어요.',
      target: 'HELPER',
      pinned: false,
      publishedAt: '2026-09-28T10:00:00',
      editedAt: '2026-09-29T15:00:00',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('2026.09.28 · 수정됨 09.29 · 대상: 도우미')).toBeVisible();
  },
};

export const LargeText: Story = { globals: { textSize: 'large' } };

export const Deleted: Story = {
  render: () => <NoticeUnavailable reason="deleted" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('삭제된 공지예요')).toBeVisible();
    await expect(canvas.getByRole('link', { name: '목록으로' })).toHaveAttribute(
      'href',
      '/notices',
    );
  },
};

export const NotFound: Story = { render: () => <NoticeUnavailable reason="notFound" /> };
