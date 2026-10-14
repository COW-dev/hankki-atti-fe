import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { OptionTile, OptionTileGroup } from './OptionTile';

const meta = {
  title: '공용 UI/OptionTile',
  component: OptionTile,
  args: { children: '배식 보조' },
  render: function Example(args) {
    const [selected, setSelected] = useState(args.selected ?? false);
    return (
      <div className="w-40">
        <OptionTile {...args} selected={selected} onClick={() => setSelected(!selected)} />
      </div>
    );
  },
} satisfies Meta<typeof OptionTile>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const tile = canvas.getByRole('checkbox', { name: '배식 보조' });
    await userEvent.tab();
    await expect(tile).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(tile).toBeChecked();
  },
};
export const Selected: Story = { args: { selected: true } };
export const Inactive: Story = { args: { inactive: true } };
export const Radio: Story = {
  render: function Example() {
    const [value, setValue] = useState('lunch');
    return (
      <OptionTileGroup
        label="식사"
        value={value}
        onChange={setValue}
        options={[
          { value: 'lunch', label: '점심' },
          { value: 'dinner', label: '저녁' },
        ]}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '저녁' })).toBeChecked();
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
