import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { CreateRequestDone } from './CreateRequestDone';

const meta = {
  title: '화면/F-01 도우미 신청 완료',
  component: CreateRequestDone,
  args: {
    onCreateAnother: fn(),
    request: {
      id: 1,
      startAt: '2026-10-12T12:00:00',
      endAt: '2026-10-12T13:00:00',
      helpTypes: ['SERVING', 'SEATING'],
      otherHelpText: null,
      memo: null,
      status: 'RECRUITING',
    },
  },
  decorators: [
    (Story) => (
      <div data-size="L" className="flex w-[390px] flex-col gap-2.5 bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateRequestDone>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Done: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(
      canvas.getByRole('heading', { name: '신청했어요! 도우미를 찾고 있어요' }),
    ).toHaveFocus();
    await expect(canvas.getByRole('link', { name: '내 신청 보기' })).toHaveAttribute(
      'href',
      '/requests',
    );
    await userEvent.click(canvas.getByRole('button', { name: '하나 더 신청하기' }));
    await expect(args.onCreateAnother).toHaveBeenCalledOnce();
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
