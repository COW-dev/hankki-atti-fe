import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { NotificationPanel } from './NotificationPanel';
import type { AppNotification } from './types';

const NOW = new Date(2026, 9, 7, 12, 0);

function notification(
  id: number,
  message: string,
  createdAt: string,
  read: boolean,
): AppNotification {
  return {
    id,
    type: 'REQUEST_MATCHED',
    message,
    targetType: 'HELP_REQUEST',
    targetId: id,
    read,
    createdAt,
  };
}

// 목업 207:2111(장애학생)의 네 건: 방금 · 10분 전 · 1시간 전 · 어제, 위 두 건만 안 읽음
const ITEMS = [
  notification(4, '12:00 식사 도우미가 정해졌어요', '2026-10-07T12:00:00', false),
  notification(3, '도우미가 바뀌었어요 — 새 도우미 이도움', '2026-10-07T11:50:00', false),
  notification(2, '도우미 사정으로 취소돼 다시 모집하고 있어요', '2026-10-07T11:00:00', true),
  notification(1, '10월 1일 신청은 지원자가 없어 매칭되지 않았어요', '2026-10-06T18:00:00', true),
];

const meta = {
  title: '알림/NotificationPanel',
  component: NotificationPanel,
  args: {
    id: 'notification-panel',
    list: { status: 'ready', items: ITEMS, nextCursor: null },
    now: NOW,
    markingAll: false,
    loadingMore: false,
    actionError: null,
    onReadAll: fn(),
    onRetry: fn(),
    onLoadMore: fn(),
    onSelect: fn(),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div data-size="L" className="mx-auto max-w-[480px] bg-(--color-bg-subtle)">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: '안 읽음, 12:00 식사 도우미가 정해졌어요, 방금' }),
    );
    await expect(args.onSelect).toHaveBeenCalledWith(ITEMS[0]);
    await expect(
      canvas.getByRole('button', { name: '10월 1일 신청은 지원자가 없어 매칭되지 않았어요, 어제' }),
    ).toBeVisible();
  },
};

export const AllRead: Story = {
  args: {
    list: {
      status: 'ready',
      items: ITEMS.map((item) => ({ ...item, read: true })),
      nextCursor: null,
    },
  },
  play: async ({ canvas }) => {
    // 안 읽은 알림이 없으면 모두 읽음은 누를 수 없고, 이유를 읽어 준다
    const readAll = canvas.getByRole('button', { name: '모두 읽음' });
    await expect(readAll).toHaveAttribute('aria-disabled', 'true');
    await expect(readAll).toHaveAccessibleDescription('안 읽은 알림이 없어요');
  },
};

export const MorePages: Story = {
  args: { list: { status: 'ready', items: ITEMS, nextCursor: 1 } },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '이전 알림 더 보기' }));
    await expect(args.onLoadMore).toHaveBeenCalledOnce();
  },
};

export const Empty: Story = { args: { list: { status: 'ready', items: [], nextCursor: null } } };

export const Loading: Story = { args: { list: { status: 'loading' } } };

export const LoadFailed: Story = { args: { list: { status: 'error' } } };

export const ActionFailed: Story = {
  args: { actionError: '모두 읽음으로 바꾸지 못했어요. 다시 시도해 주세요' },
};

export const Helper: Story = {
  decorators: [
    (Story) => (
      <div data-size="M" className="mx-auto max-w-[480px] bg-(--color-bg-subtle)">
        <Story />
      </div>
    ),
  ],
};

export const LargeText: Story = { globals: { textSize: 'large' } };
