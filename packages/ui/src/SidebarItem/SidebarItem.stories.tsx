import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { SidebarItem } from './SidebarItem';
const meta = {
  title: '공용 UI/SidebarItem',
  component: SidebarItem,
  args: { href: '/students', children: '장애학생', active: false },
  decorators: [
    (Story) => (
      <nav aria-label="관리자 메뉴" data-size="admin" className="w-[220px]">
        <Story />
      </nav>
    ),
  ],
} satisfies Meta<typeof SidebarItem>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Active: Story = {
  args: { active: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: '장애학생' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
