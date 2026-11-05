import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { Pagination } from './Pagination';
const meta = {
  title: '공용 UI/Pagination',
  component: Pagination,
  args: { label: '학생 목록 페이지', page: 0, totalPages: 5, onChange: fn() },
  render: function Example(args) {
    const [page, setPage] = useState(args.page);
    return (
      <div data-size="admin">
        <Pagination {...args} page={page} onChange={setPage} />
      </div>
    );
  },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(canvas.getByRole('button', { name: '2페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
