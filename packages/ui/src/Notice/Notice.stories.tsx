import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ErrorNotice } from './Notice';

const meta = {
  title: '공용 UI/ErrorNotice',
  component: ErrorNotice,
  args: { message: '아이디 또는 비밀번호를 확인해 주세요' },
} satisfies Meta<typeof ErrorNotice>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent(args.message);
  },
};
export const LongMessage: Story = {
  args: {
    message:
      '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요. 계속 문제가 발생하면 장애학생지원센터에 문의해 주세요.',
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
