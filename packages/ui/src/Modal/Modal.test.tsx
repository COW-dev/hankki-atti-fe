import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  afterEach(() => {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  });
  it('제목과 설명을 연결하고 파괴적 동작 대신 제목에 포커스를 둔다', async () => {
    // jsdom에는 native dialog가 없어 열기·닫기만 대체한다. 포커스 가두기와 Esc는 브라우저 스토리에서 검증한다.
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      },
    });
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const { rerender } = render(
      <Modal
        open
        title="신청을 취소할까요?"
        confirmLabel="취소하기"
        onClose={onClose}
        onConfirm={onConfirm}
        destructive
      >
        취소하면 다시 신청해야 해요.
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: '신청을 취소할까요?' });
    expect(dialog).toHaveAccessibleDescription('취소하면 다시 신청해야 해요.');
    expect(screen.getByRole('heading', { name: '신청을 취소할까요?' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: '취소하기' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledOnce();
    rerender(
      <Modal
        open={false}
        title="신청을 취소할까요?"
        confirmLabel="취소하기"
        onClose={onClose}
        onConfirm={onConfirm}
      >
        취소하면 다시 신청해야 해요.
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('아이콘을 주면 장식으로 숨기고 제목이 이름이 된다', () => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      },
    });
    // afterEach가 dialog 대체 구현을 지우기 전에 내린다
    const { unmount } = render(
      <Modal open title="매칭됐어요!" icon={<span>✓</span>} onClose={() => {}}>
        못 가게 되면 매칭 현황에서 취소해 주세요
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: '매칭됐어요!' });
    expect(dialog).toHaveAccessibleName('매칭됐어요!');
    expect(screen.queryByText('✓')).not.toBeNull();
    expect(screen.getByText('✓').closest('[aria-hidden]')).not.toBeNull();
    unmount();
  });
});
