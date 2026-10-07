import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { StudentTabBar } from './TabBar';

const meta = {
  title: '앱/StudentTabBar',
  component: StudentTabBar,
  args: { active: '/requests' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StudentTabBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MyRequests: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: '내 신청' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('link', { name: '도우미 신청' })).not.toHaveAttribute(
      'aria-current',
    );
  },
};
export const Apply: Story = { args: { active: '/requests/new' } };
export const Notices: Story = { args: { active: '/notices' } };
export const MyPage: Story = { args: { active: '/mypage' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
