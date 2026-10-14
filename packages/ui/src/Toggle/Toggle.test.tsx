import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';
describe('Toggle', () => {
  it('클릭으로 켜고 끄면 현재 상태를 알린다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Toggle label="알림 받기" checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: '알림 받기' });
    await user.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith(true);
    rerender(<Toggle label="알림 받기" checked onChange={onChange} />);
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith(false);
    rerender(<Toggle label="알림 받기" checked={false} onChange={onChange} />);
    expect(toggle).not.toBeChecked();
  });
  it('키보드로 반대 상태를 요청하고 현재 상태를 알린다', async () => {
    const onChange = vi.fn();
    render(<Toggle label="알림 받기" checked={false} onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('switch', { name: '알림 받기' })).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it('비활성이면 포커스는 받지만 상태를 바꾸지 않는다', async () => {
    const onChange = vi.fn();
    render(<Toggle label="알림 받기" checked inactive onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('switch', { name: '알림 받기' })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });
});
