import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { OptionGroup, OptionTile } from '@hankki/ui';

function Checkboxes({ onChange = () => undefined }: { onChange?: (next: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(['SERVING']);
  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    setSelected(next);
    onChange(next);
  };
  return (
    <OptionGroup legend="필요한 도움" columns={1}>
      {[
        ['SERVING', '배식 보조'],
        ['SEATING', '좌석 안내'],
      ].map(([value, label]) => (
        <OptionTile
          key={value}
          type="checkbox"
          name="helpTypes"
          value={value}
          checked={selected.includes(value)}
          onChange={() => toggle(value)}
        >
          {label}
        </OptionTile>
      ))}
      <OptionTile type="checkbox" name="helpTypes" value="OTHER" checked={false} disabled>
        기타
      </OptionTile>
    </OptionGroup>
  );
}

describe('OptionTile', () => {
  it('진짜 체크박스로 읽히고 legend가 그룹 이름이다', () => {
    render(<Checkboxes />);

    expect(screen.getByRole('group', { name: '필요한 도움' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '배식 보조' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '좌석 안내' })).not.toBeChecked();
  });

  it('타일을 누르거나 Space로 토글한다', async () => {
    const onChange = vi.fn();
    render(<Checkboxes onChange={onChange} />);

    await userEvent.click(screen.getByText('좌석 안내'));
    expect(screen.getByRole('checkbox', { name: '좌석 안내' })).toBeChecked();

    screen.getByRole('checkbox', { name: '배식 보조' }).focus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: '배식 보조' })).not.toBeChecked();

    expect(onChange).toHaveBeenLastCalledWith(['SEATING']);
  });

  it('disabled 타일은 눌러도 바뀌지 않는다', async () => {
    render(<Checkboxes />);
    const other = screen.getByRole('checkbox', { name: '기타' });

    await userEvent.click(screen.getByText('기타'));

    expect(other).toBeDisabled();
    expect(other).not.toBeChecked();
  });

  it('radio 타입은 라디오로 읽힌다', () => {
    render(
      <OptionGroup legend="취소 사유">
        <OptionTile type="radio" name="reason" value="SICK" checked onChange={() => undefined}>
          아파서
        </OptionTile>
        <OptionTile
          type="radio"
          name="reason"
          value="OTHER"
          checked={false}
          onChange={() => undefined}
        >
          기타
        </OptionTile>
      </OptionGroup>,
    );

    expect(screen.getByRole('radio', { name: '아파서' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '기타' })).not.toBeChecked();
  });
});
