import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputCompact } from './InputCompact';
describe('InputCompact', () => {
  it('보이지 않는 라벨로 검색 입력 이름을 제공하고 입력 변경을 전달한다', async () => {
    const onChange = vi.fn();
    render(<InputCompact label="이름·학번 검색" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: '이름·학번 검색' });
    await userEvent.type(input, '김');
    expect(input).toHaveValue('김');
    expect(onChange).toHaveBeenCalledOnce();
  });
  it('선택 입력은 이름과 선택지를 제공하고 값을 변경한다', async () => {
    render(
      <InputCompact
        kind="select"
        label="소속"
        options={[
          { value: 'all', label: '전체' },
          { value: 'atti', label: '아띠' },
        ]}
      />,
    );
    const select = screen.getByRole('combobox', { name: '소속' });
    await userEvent.selectOptions(select, 'atti');
    expect(select).toHaveValue('atti');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
