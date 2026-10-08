import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, Modal } from '@hankki/ui';

function renderModal({
  open = true,
  onClose = vi.fn(),
  dismissOnBackdrop,
}: {
  open?: boolean;
  onClose?: () => void;
  dismissOnBackdrop?: boolean;
} = {}) {
  render(
    <Modal
      open={open}
      onClose={onClose}
      title="도우미가 오지 않았나요?"
      description="10월 2일 (목) 12:30 · 도우미 김도움"
      dismissOnBackdrop={dismissOnBackdrop}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            돌아가기
          </Button>
          <Button variant="danger">신고하기</Button>
        </>
      }
    >
      <p>이용 후 24시간까지 신고할 수 있어요</p>
    </Modal>,
  );
  return { onClose };
}

describe('Modal', () => {
  it('열리면 제목이 이름, 설명이 설명인 dialog가 되고 제목에 포커스한다', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: '도우미가 오지 않았나요?' });
    expect(dialog).toHaveAccessibleDescription('10월 2일 (목) 12:30 · 도우미 김도움');
    expect(screen.getByRole('heading', { name: '도우미가 오지 않았나요?' })).toHaveFocus();
    expect(screen.getByRole('button', { name: '신고하기' })).not.toHaveFocus();
  });

  it('닫혀 있으면 열리지 않는다', () => {
    const { container } = render(
      <Modal open={false} onClose={() => undefined} title="이 요청에 지원할까요?" />,
    );

    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('Esc를 누르면 onClose를 부른다', async () => {
    const { onClose } = renderModal();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('배경을 누르면 닫히고, dismissOnBackdrop이 false면 닫히지 않는다', async () => {
    const { onClose } = renderModal();
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();

    const kept = renderModal({ dismissOnBackdrop: false });
    const dialogs = screen.getAllByRole('dialog');
    await userEvent.click(dialogs[dialogs.length - 1]);
    expect(kept.onClose).not.toHaveBeenCalled();
  });

  it('안쪽 내용을 눌러도 닫히지 않는다', async () => {
    const { onClose } = renderModal();

    await userEvent.click(screen.getByText('이용 후 24시간까지 신고할 수 있어요'));

    expect(onClose).not.toHaveBeenCalled();
  });
});
