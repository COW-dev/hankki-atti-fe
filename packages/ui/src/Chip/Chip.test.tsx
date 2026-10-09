import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChipGroup } from '@hankki/ui';

const OPTIONS = [
  { value: 'today', label: '오늘 10/6' },
  {
    value: 'tomorrow',
    label: '내일 10/7',
    disabled: true,
    disabledReason: '이미 신청한 시간과 겹쳐요',
  },
  { value: 'wed', label: '10/8 (수)' },
];

function Harness({
  initial = null,
  onChange = () => undefined,
}: {
  initial?: string | null;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <>
      <button type="button">앞 버튼</button>
      <ChipGroup
        label="날짜"
        options={OPTIONS}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    </>
  );
}

describe('ChipGroup', () => {
  it('라디오 그룹으로 읽히고 선택된 칩만 checked다', () => {
    render(<Harness initial="wed" />);

    expect(screen.getByRole('radiogroup', { name: '날짜' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: '10/8 (수)' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: '오늘 10/6' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('Tab은 그룹에 한 번만 들어오고 선택된 칩으로 간다', async () => {
    render(<Harness initial="wed" />);

    await userEvent.tab();
    await userEvent.tab();

    expect(screen.getByRole('radio', { name: '10/8 (수)' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: '오늘 10/6' })).toHaveAttribute('tabindex', '-1');
  });

  it('선택이 없으면 첫 칩으로 들어오고, 화살표로 옮기면 바로 선택된다', async () => {
    // given
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: '오늘 10/6' })).toHaveFocus();

    // when — → 두 번이면 10/8, 한 번 더 → 는 처음으로 돌아온다
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('radio', { name: '10/8 (수)' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: '10/8 (수)' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.keyboard('{ArrowRight}');

    // then
    expect(screen.getByRole('radio', { name: '오늘 10/6' })).toHaveFocus();
    expect(onChange).toHaveBeenNthCalledWith(1, 'wed');
    expect(onChange).toHaveBeenNthCalledWith(2, 'today');
  });

  it('disabled 칩에도 화살표로 들어가 이유를 읽어 주지만 선택되지는 않는다 (색만으로 알리지 않는다)', async () => {
    // given
    const onChange = vi.fn();
    render(<Harness initial="today" onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();

    // when
    await userEvent.keyboard('{ArrowRight}');

    // then
    const blocked = screen.getByRole('radio', { name: /내일 10\/7.*겹쳐요/ });
    expect(blocked).toHaveFocus();
    expect(blocked).toHaveAttribute('aria-disabled', 'true');
    expect(blocked).toHaveAttribute('aria-checked', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Home·End는 처음·끝 칩을 고른다', async () => {
    render(<Harness initial="today" />);
    await userEvent.tab();
    await userEvent.tab();

    await userEvent.keyboard('{End}');
    expect(screen.getByRole('radio', { name: '10/8 (수)' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: '오늘 10/6' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('클릭으로 고르고, disabled 칩은 눌러도 바뀌지 않는다', async () => {
    const onChange = vi.fn();
    render(<Harness initial="today" onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: '10/8 (수)' }));
    await userEvent.click(screen.getByRole('radio', { name: /내일 10\/7/ }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('wed');
    expect(screen.getByRole('radio', { name: /내일 10\/7/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});
