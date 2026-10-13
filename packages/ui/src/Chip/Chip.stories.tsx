import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChipGroup } from './Chip';

const meta = {
  title: '공용 UI/Chip',
  component: ChipGroup,
  args: {
    label: '식사 시간',
    value: '12:00',
    onChange: () => {},
    options: [
      { value: '12:00', label: '12:00' },
      { value: '12:30', label: '12:30' },
      { value: '13:00', label: '13:00', inactive: true, describedBy: 'chip-reason' },
    ],
  },
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    return (
      <>
        <ChipGroup {...args} value={value} onChange={setValue} />
        <p id="chip-reason" className="typo-caption">
          13:00에는 신청할 수 없어요.
        </p>
      </>
    );
  },
} satisfies Meta<typeof ChipGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Medium: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
