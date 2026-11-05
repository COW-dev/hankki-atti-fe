import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TabNav } from './TabNav';
const meta = {
  title: '공용 UI/TabNav',
  component: TabNav,
  args: {
    label: '장애학생 관리 보기',
    items: [
      { href: '/students', label: '학생 목록' },
      { href: '/students/requests', label: '전체 신청 현황' },
    ],
    current: '/students',
  },
  decorators: [
    (Story) => (
      <div data-size="admin">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabNav>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: '학생 목록' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
