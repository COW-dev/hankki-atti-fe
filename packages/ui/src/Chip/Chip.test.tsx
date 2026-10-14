import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Chip } from './Chip';
import { ChipGroup } from './ChipGroup';

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

describe('ChipGroup 신청 화면 호환', () => {
  it('빈 선택값이면 첫 활성 칩으로 진입하고 외부 제목으로 그룹을 읽는다', async () => {
    render(
      <>
        <p id="date-label">날짜</p>
        <ChipGroup
          labelledBy="date-label"
          value={null}
          onChange={() => undefined}
          columns={4}
          options={[
            { value: 'a', label: '오늘', disabled: true },
            { value: 'b', label: '내일' },
          ]}
        />
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('radiogroup', { name: '날짜' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '내일' })).toHaveFocus();
  });
  it('선택된 비활성 칩은 이유를 읽고 클릭은 막으며 방향키는 활성 칩으로 이동한다', async () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        label="시각"
        value="a"
        onChange={onChange}
        options={[
          {
            value: 'a',
            label: '12:00',
            disabled: true,
            disabledReason: '이미 신청한 시간과 겹쳐요',
          },
          { value: 'b', label: '13:00' },
        ]}
      />,
    );
    await userEvent.tab();
    const blocked = screen.getByRole('radio', { name: /12:00.*겹쳐요/ });
    expect(blocked).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '13:00' })).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
