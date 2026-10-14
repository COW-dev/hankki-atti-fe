import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OptionTile, OptionTileGroup } from './OptionTile';

describe('OptionTile', () => {
  it('체크박스는 이름과 선택 상태를 알리고 키보드로 선택한다', async () => {
    function Example() {
      const [selected, setSelected] = useState(false);
      return (
        <OptionTile selected={selected} onClick={() => setSelected(!selected)}>
          배식 보조
        </OptionTile>
      );
    }
    render(<Example />);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: '배식 보조' })).toBeChecked();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it('비활성 타일은 포커스를 받지만 선택하지 않는다', async () => {
    const onClick = vi.fn();
    render(
      <OptionTile inactive onClick={onClick}>
        배식 보조
      </OptionTile>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('checkbox', { name: '배식 보조' })).toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });
  it('라디오 묶음은 방향키로 비활성 항목을 건너뛰고 Home과 End로 이동한다', async () => {
    function Example() {
      const [value, setValue] = useState('a');
      return (
        <OptionTileGroup
          label="식사"
          value={value}
          onChange={setValue}
          options={[
            { value: 'a', label: '점심' },
            { value: 'b', label: '간식', inactive: true },
            { value: 'c', label: '저녁' },
          ]}
        />
      );
    }
    render(<Example />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '저녁' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: '저녁' })).toBeChecked();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: '점심' })).toBeChecked();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('radio', { name: '저녁' })).toBeChecked();
  });
  it('선택 항목이 비활성으로 바뀌어도 그 위치에서 이전 활성 항목으로 이동한다', async () => {
    const onChange = vi.fn();
    render(
      <OptionTileGroup
        label="식사"
        value="b"
        onChange={onChange}
        options={[
          { value: 'a', label: '점심' },
          { value: 'b', label: '간식', inactive: true },
          { value: 'c', label: '저녁' },
        ]}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: '점심' })).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
