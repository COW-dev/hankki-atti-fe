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
// 취소 사유처럼 문구가 긴 라디오 목록은 1열 (목업 209:3672)
export const RadioSingleColumn: Story = {
  render: function Example() {
    const [value, setValue] = useState('ILLNESS');
    return (
      <OptionTileGroup
        label="취소 사유"
        columns={1}
        value={value}
        onChange={setValue}
        options={[
          { value: 'ILLNESS', label: '질병·부상' },
          { value: 'ACADEMIC', label: '학사 일정 변경 (시험·보강)' },
          { value: 'FAMILY', label: '가족 경조사' },
          { value: 'OTHER', label: '기타 (직접 입력)' },
        ]}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: '학사 일정 변경 (시험·보강)' })).toBeChecked();
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
