import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminNoticeEditorScreen } from '@/features/admin-notices/AdminNoticeEditorScreen';
import type { AdminNoticeDetail } from '@/features/admin-notices/types';
import { ApiError } from '@/lib/api/client';
import type { AdminMe } from '@/lib/auth/useSessionGuard';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest, logout: vi.fn() }),
}));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const guard = vi.hoisted(() => ({ me: null as AdminMe | null }));
vi.mock('@/lib/auth/useSessionGuard', () => ({ useSessionGuard: () => guard.me }));

const admin = (grade: AdminMe['grade']): AdminMe => ({
  accountId: 1,
  loginId: 'center01',
  name: '홍길동',
  grade,
  role: 'ADMIN',
  accessibilityMode: false,
});

const detail: AdminNoticeDetail = {
  noticeId: 7,
  title: '운영 시간 안내',
  body: '바뀌어요',
  target: 'ATTI',
  pinned: true,
  publishedAt: '2026-10-01T09:00:00',
  editedAt: null,
};

describe('AdminNoticeEditorScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    push.mockReset();
    guard.me = admin('FULL');
  });

  it('제한 권한이면 폼 대신 안내만 보여 준다', () => {
    guard.me = admin('LIMITED');
    render(<AdminNoticeEditorScreen />);

    expect(screen.getByText('전체 권한 관리자만 공지를 쓰고 고칠 수 있어요')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '제목 *' })).not.toBeInTheDocument();
  });

  it('비워 둔 칸이 있으면 보내지 않고 첫 오류 칸으로 포커스를 옮긴다', async () => {
    const user = userEvent.setup();
    render(<AdminNoticeEditorScreen />);

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(authRequest).not.toHaveBeenCalled();
    expect(screen.getByText('입력한 내용을 확인해 주세요 (3곳)')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '제목 *' })).toHaveFocus();
  });

  it('대상만 빠지면 대상 칩으로 포커스를 옮긴다', async () => {
    const user = userEvent.setup();
    render(<AdminNoticeEditorScreen />);
    await user.type(screen.getByRole('textbox', { name: '제목 *' }), '제목');
    await user.type(screen.getByRole('textbox', { name: '본문 *' }), '본문');

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByRole('radio', { name: '전체' })).toHaveFocus();
  });

  it('작성하면 입력값을 게시하고 목록으로 돌아간다', async () => {
    const user = userEvent.setup();
    authRequest.mockResolvedValue(detail);
    render(<AdminNoticeEditorScreen />);
    await user.type(screen.getByRole('textbox', { name: '제목 *' }), '제목');
    await user.type(screen.getByRole('textbox', { name: '본문 *' }), '본문');
    await user.click(screen.getByRole('radio', { name: '도우미' }));
    await user.click(screen.getByRole('checkbox', { name: '목록 맨 위에 고정' }));

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(authRequest).toHaveBeenCalledWith('/api/admin/notices', {
      method: 'POST',
      body: { title: '제목', body: '본문', target: 'HELPER', pinned: true },
    });
    expect(push).toHaveBeenCalledWith('/notices');
  });

  it('수정은 저장된 값을 채우고 아띠 대상을 유지해 저장한다', async () => {
    const user = userEvent.setup();
    authRequest.mockResolvedValue(detail);
    render(<AdminNoticeEditorScreen noticeId={7} />);

    expect(await screen.findByRole('textbox', { name: '제목 *' })).toHaveValue('운영 시간 안내');
    expect(screen.getByRole('radio', { name: '아띠' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '목록 맨 위에 고정' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(authRequest).toHaveBeenLastCalledWith('/api/admin/notices/7', {
      method: 'PATCH',
      body: { title: '운영 시간 안내', body: '바뀌어요', target: 'ATTI', pinned: true },
    });
  });

  it('저장 중에는 입력을 바꾸거나 삭제를 시작할 수 없다', async () => {
    const user = userEvent.setup();
    authRequest.mockResolvedValueOnce(detail);
    authRequest.mockImplementationOnce(() => new Promise(() => {}));
    render(<AdminNoticeEditorScreen noticeId={7} />);
    await screen.findByRole('textbox', { name: '제목 *' });

    await user.click(screen.getByRole('button', { name: '저장' }));
    await user.type(screen.getByRole('textbox', { name: '제목 *' }), '추가');
    await user.type(screen.getByRole('textbox', { name: '본문 *' }), '추가');
    await user.click(screen.getByRole('radio', { name: '전체' }));
    await user.click(screen.getByRole('checkbox', { name: '목록 맨 위에 고정' }));
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(screen.getByRole('textbox', { name: '제목 *' })).toHaveValue(detail.title);
    expect(screen.getByRole('textbox', { name: '본문 *' })).toHaveValue(detail.body);
    expect(screen.getByRole('radio', { name: '아띠' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '목록 맨 위에 고정' })).toBeChecked();
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toHaveAccessibleDescription(
      '공지를 저장하고 있어요',
    );
    expect(authRequest).toHaveBeenCalledTimes(2);
  });

  it('저장에 실패하면 입력을 남기고 이유를 알려 다시 누를 수 있다', async () => {
    const user = userEvent.setup();
    authRequest.mockResolvedValueOnce(detail);
    authRequest.mockRejectedValueOnce(new ApiError(404, 'NOTICE_DELETED', '삭제된 공지입니다.'));
    render(<AdminNoticeEditorScreen noticeId={7} />);
    await screen.findByRole('textbox', { name: '제목 *' });

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('삭제된 공지예요')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '제목 *' })).toHaveValue('운영 시간 안내');
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '저장' })).not.toHaveAttribute('aria-disabled');
  });

  it('삭제된 공지로 들어오면 다시 시도 대신 목록 링크를 보여 준다', async () => {
    authRequest.mockRejectedValue(new ApiError(404, 'NOTICE_DELETED', '삭제된 공지입니다.'));
    render(<AdminNoticeEditorScreen noticeId={7} />);

    expect(await screen.findByRole('link', { name: '공지 목록으로' })).toHaveAttribute(
      'href',
      '/notices',
    );
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  it('수정 화면에서 삭제하면 목록으로 돌아간다', async () => {
    const user = userEvent.setup();
    authRequest.mockResolvedValue(detail);
    render(<AdminNoticeEditorScreen noticeId={7} />);

    await user.click(await screen.findByRole('button', { name: '삭제' }));
    const dialog = within(screen.getByRole('dialog', { hidden: true }));
    await user.click(dialog.getByRole('button', { name: '삭제', hidden: true }));

    expect(authRequest).toHaveBeenLastCalledWith('/api/admin/notices/7', { method: 'DELETE' });
    expect(push).toHaveBeenCalledWith('/notices');
  });
});
