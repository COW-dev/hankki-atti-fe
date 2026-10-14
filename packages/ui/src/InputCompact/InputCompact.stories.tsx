import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { InputCompact } from './InputCompact';
const meta = {
  title: '공용 UI/InputCompact',
  component: InputCompact,
  args: { label: '이름·학번 검색', placeholder: '이름·학번 검색' },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputCompact>;
export default meta;
type Story = StoryObj<typeof InputCompact>;
export const Text: Story = {
  args: { label: '이름·학번 검색', placeholder: '이름·학번 검색' },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '이름·학번 검색' });
    await userEvent.type(input, '김아띠');
    await expect(input).toHaveValue('김아띠');
  },
};
export const Select: Story = {
  args: {
    kind: 'select',
    label: '소속',
    options: [
      { value: 'all', label: '전체 소속' },
      { value: 'atti', label: '아띠' },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: '소속' });
    await userEvent.selectOptions(select, 'atti');
    await expect(select).toHaveValue('atti');
  },
};
export const LargeText: Story = {
  args: { label: '이름·학번 검색', placeholder: '이름·학번 검색' },
  globals: { textSize: 'large' },
};
