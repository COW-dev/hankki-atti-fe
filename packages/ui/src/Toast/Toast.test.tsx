import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast, TOAST_DURATION_MS } from './Toast';

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('문구가 없어도 live 영역을 미리 두고 문구가 생기면 정중하게 알린다', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Toast message={null} onClose={onClose} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    rerender(<Toast message="신청을 철회했어요" onClose={onClose} />);
    expect(screen.getByRole('status')).toHaveTextContent('신청을 철회했어요');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('2초가 지나면 닫기를 요청한다', () => {
    const onClose = vi.fn();
    render(<Toast message="메일을 다시 보냈어요" onClose={onClose} />);

    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 1));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('문구가 바뀌면 2초를 새로 센다', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Toast message="준비 중인 문서예요" onClose={onClose} />);
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 500));

    rerender(<Toast message="연락 정보를 저장했어요" onClose={onClose} />);
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 1));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
