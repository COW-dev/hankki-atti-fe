import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('현재 페이지를 알리고 다른 페이지를 누르면 그 번호를 넘긴다', async () => {
    const onChange = vi.fn();
    render(<Pagination label="학생 목록 페이지" page={1} totalPages={3} onChange={onChange} />);

    expect(screen.getByRole('navigation', { name: '학생 목록 페이지' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2페이지' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(screen.getByRole('button', { name: '3페이지' }));
    await userEvent.click(screen.getByRole('button', { name: '이전 페이지' }));
    expect(onChange.mock.calls).toEqual([[2], [0]]);
  });

  it('첫 페이지면 이전 버튼이 포커스는 받되 눌러도 이동하지 않는다', async () => {
    const onChange = vi.fn();
    render(<Pagination label="학생 목록 페이지" page={0} totalPages={1} onChange={onChange} />);

    const prev = screen.getByRole('button', { name: '이전 페이지' });
    expect(prev).toHaveAttribute('aria-disabled', 'true');
    expect(prev).toBeEnabled();
    await userEvent.click(prev);
    await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    await userEvent.click(screen.getByRole('button', { name: '1페이지' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
