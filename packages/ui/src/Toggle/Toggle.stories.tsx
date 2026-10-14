import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { Toggle } from './Toggle';
const meta = {
  title: '공용 UI/Toggle',
  component: Toggle,
  args: { label: '알림 받기', checked: false, onChange: fn() },
  render: function Example(args) {
    const [checked, setChecked] = useState(args.checked);
    return <Toggle {...args} checked={checked} onChange={setChecked} />;
  },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Off: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('switch', { name: '알림 받기' })).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('switch', { name: '알림 받기' })).not.toBeChecked();
  },
};
export const On: Story = { args: { checked: true } };
export const Inactive: Story = { args: { inactive: true } };
export const InactiveOn: Story = { args: { inactive: true, checked: true } };
export const LargeText: Story = { globals: { textSize: 'large' } };
