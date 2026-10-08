import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { ChipGroup, type ChipOption } from './ChipGroup';

const DATES: ChipOption<string>[] = [
  { value: '2026-10-06', label: '오늘 10/6' },
  { value: '2026-10-07', label: '내일 10/7' },
  { value: '2026-10-08', label: '10/8 (수)' },
  { value: 'more', label: '다른 날짜' },
];
const TIMES: ChipOption<string>[] = [
  { value: '11:30', label: '11:30' },
  { value: '12:00', label: '12:00' },
  { value: '12:30', label: '12:30' },
  { value: '13:00', label: '13:00' },
];

function Controlled({
  options,
  columns,
  initial,
}: {
  options: ChipOption<string>[];
  columns: 1 | 2 | 3 | 4;
  initial: string | null;
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <ChipGroup label="날짜" options={options} value={value} onChange={setValue} columns={columns} />
  );
}

const meta = {
  title: '공용 UI/ChipGroup',
  component: Controlled,
  args: { options: DATES, columns: 2, initial: '2026-10-07' },
  decorators: [
    (Story) => (
      <div className="w-[358px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Controlled>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Dates: Story = {};
export const Times: Story = { args: { options: TIMES, columns: 4, initial: '12:00' } };
export const NoneSelected: Story = { args: { initial: null } };
export const WithDisabled: Story = {
  args: { options: [...TIMES.slice(0, 2), { ...TIMES[2], disabled: true }, TIMES[3]], columns: 4 },
};
export const Keyboard: Story = {
  args: { options: TIMES, columns: 4, initial: '12:00' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const selected = canvas.getByRole('radio', { name: '12:00' });
    await expect(selected).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '12:30' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(canvas.getByRole('radio', { name: '12:30' })).toHaveFocus();
  },
};
export const HelperSize: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = {
  args: { options: TIMES, columns: 4, initial: '12:00' },
  globals: { textSize: 'large' },
};
