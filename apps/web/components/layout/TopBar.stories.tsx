import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect } from 'storybook/test';
import { TopBar } from './TopBar';

const meta = {
  title: '앱/TopBar',
  component: TopBar,
  args: { title: '로그인' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TopBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Back: Story = {
  args: { back: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '뒤로' }));
    await expect(getRouter().back).toHaveBeenCalledOnce();
    await expect(canvas.getByRole('heading', { level: 1, name: '로그인' })).toBeVisible();
  },
};
export const Logo: Story = { args: { logo: true, title: '내 신청' } };
export const Notification: Story = { args: { logo: true, bell: true, title: '내 신청' } };
export const LargeText: Story = {
  args: { back: true, title: '비밀번호 변경' },
  globals: { textSize: 'large' },
};
