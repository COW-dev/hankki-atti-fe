import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Chip, ChipGroup } from './Chip';

describe('Chip', () => {
  it('비활성 칩은 포커스를 받고 선택은 막는다', async () => {
    const onClick = vi.fn();
    render(
      <div role="radiogroup" aria-label="시간">
        <Chip inactive onClick={onClick}>
          12:00
        </Chip>
      </div>,
    );
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('radio', { name: '12:00' })).toHaveFocus();
    expect(screen.getByRole('radio')).toHaveAttribute('aria-disabled', 'true');
    expect(onClick).not.toHaveBeenCalled();
  });
  it('방향키와 Home·End는 비활성 항목을 건너뛰고 선택과 포커스를 함께 옮긴다', async () => {
    function Example() {
      const [value, setValue] = useState('a');
      return (
        <ChipGroup
          label="시간"
          value={value}
          onChange={setValue}
          options={[
            { value: 'a', label: '12:00' },
            { value: 'b', label: '12:30', inactive: true },
            { value: 'c', label: '13:00' },
          ]}
        />
      );
    }
    render(<Example />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '13:00' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: '13:00' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '12:00' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('radio', { name: '13:00' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: '12:00' })).toHaveAttribute('aria-checked', 'true');
  });
  it('모두 비활성이면 방향키로 선택하지 않는다', async () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        label="시간"
        value="a"
        onChange={onChange}
        options={[{ value: 'a', label: '12:00', inactive: true }]}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('선택 항목이 비활성이면 그 위치에서 이전 활성 항목으로 이동한다', async () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        label="시간"
        value="b"
        onChange={onChange}
        options={[
          { value: 'a', label: '12:00' },
          { value: 'b', label: '12:30', inactive: true },
          { value: 'c', label: '13:00' },
        ]}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: '12:00' })).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
