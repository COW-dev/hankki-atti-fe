import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { RequestCard } from './RequestCard';
const meta = {
  title: '공용 UI/RequestCard',
  component: RequestCard,
  args: {
    title: '10월 7일 (화) 12:00 ~ 13:00',
    meta: '필요한 도움: 배식 보조 · 좌석 안내',
    status: 'success',
    statusLabel: '매칭 완료',
    partner: '도우미 김아띠 · 카톡 ID hanggi_atti',
    action: { label: '취소하기', onClick: fn() },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[358px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RequestCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Matched: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: `${args.title} 신청 취소하기` }));
    await expect(args.action?.onClick).toHaveBeenCalledOnce();
  },
};
export const Recruiting: Story = {
  args: { status: 'progress', statusLabel: '모집 중', partner: undefined, action: undefined },
};
export const HelperSize: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
