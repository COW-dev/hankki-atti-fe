import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminNoticesScreen } from '@/features/admin-notices/AdminNoticesScreen';
import type { AdminNoticePage } from '@/features/admin-notices/types';
import { ApiError } from '@/lib/api/client';
import type { AdminMe } from '@/lib/auth/useSessionGuard';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest, logout: vi.fn() }),
}));

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

const notice = {
  noticeId: 7,
  title: '운영 시간 안내',
  target: 'HELPER',
  pinned: true,
  publishedAt: '2026-10-01T09:00:00',
  editedAt: null,
} as const;

const listPage = (overrides: Partial<AdminNoticePage> = {}): AdminNoticePage => ({
  notices: [notice],
  page: 0,
  size: 20,
  totalCount: 1,
  totalPages: 1,
  ...overrides,
});

describe('AdminNoticesScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    authRequest.mockResolvedValue(listPage());
    guard.me = admin('FULL');
  });

  it('전체 권한이면 공지 정보와 작성·수정·삭제 동작을 보여 준다', async () => {
    render(<AdminNoticesScreen />);

    const edit = await screen.findByRole('link', { name: '운영 시간 안내 수정' });
    expect(edit).toHaveAttribute('href', '/notices/7/edit');
    expect(screen.getByRole('link', { name: '+ 새 공지' })).toHaveAttribute('href', '/notices/new');
    const row = within(screen.getByRole('row', { name: /운영 시간 안내 도우미/ }));
    expect(row.getByText('도우미')).toBeInTheDocument();
    expect(row.getByText('고정')).toBeInTheDocument();
    expect(row.getByText('10.01')).toBeInTheDocument();
    expect(row.getByText('수정 안 함')).toBeInTheDocument();
  });

  it('제한 권한이면 목록만 보고 동작은 없다', async () => {
    guard.me = admin('LIMITED');
    render(<AdminNoticesScreen />);

    expect(await screen.findByRole('rowheader', { name: '운영 시간 안내' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '+ 새 공지' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '운영 시간 안내 삭제' })).not.toBeInTheDocument();
  });

  it('삭제하면 목록을 다시 불러오고 완료를 알린 뒤 표로 포커스를 옮긴다', async () => {
    const user = userEvent.setup();
    render(<AdminNoticesScreen />);
    await user.click(await screen.findByRole('button', { name: '운영 시간 안내 삭제' }));
    authRequest.mockReset();
    authRequest.mockResolvedValueOnce({ noticeId: 7 });
    authRequest.mockResolvedValueOnce(listPage({ notices: [], totalCount: 0, totalPages: 0 }));

    const dialog = within(screen.getByRole('dialog', { hidden: true }));
    await user.click(dialog.getByRole('button', { name: '삭제', hidden: true }));

    expect(await screen.findByText('등록된 공지가 없어요')).toBeInTheDocument();
    expect(authRequest).toHaveBeenNthCalledWith(1, '/api/admin/notices/7', { method: 'DELETE' });
    expect(screen.getByText('공지를 삭제했어요')).toBeInTheDocument();
    expect(screen.getByRole('table').parentElement).toHaveFocus();
  });

  it('이미 지워진 공지를 삭제하면 그렇게 알리고 목록을 새로 고친다', async () => {
    const user = userEvent.setup();
    render(<AdminNoticesScreen />);
    await user.click(await screen.findByRole('button', { name: '운영 시간 안내 삭제' }));
    authRequest.mockReset();
    authRequest.mockRejectedValueOnce(new ApiError(404, 'NOTICE_DELETED', '삭제된 공지입니다.'));
    authRequest.mockResolvedValueOnce(listPage({ notices: [], totalCount: 0, totalPages: 0 }));

    const dialog = within(screen.getByRole('dialog', { hidden: true }));
    await user.click(dialog.getByRole('button', { name: '삭제', hidden: true }));

    expect(await screen.findByText('이미 삭제된 공지예요')).toBeInTheDocument();
  });

  it('삭제 중에는 취소나 Esc로 창을 닫거나 중복 요청할 수 없다', async () => {
    const user = userEvent.setup();
    render(<AdminNoticesScreen />);
    await user.click(await screen.findByRole('button', { name: '운영 시간 안내 삭제' }));
    authRequest.mockReset();
    authRequest.mockImplementation(() => new Promise(() => {}));
    const dialog = within(screen.getByRole('dialog', { hidden: true }));

    await user.click(dialog.getByRole('button', { name: '삭제', hidden: true }));
    await user.click(dialog.getByRole('button', { name: '삭제', hidden: true }));
    await user.click(dialog.getByRole('button', { name: '취소', hidden: true }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
    expect(authRequest).toHaveBeenCalledTimes(1);
    expect(dialog.getByRole('button', { name: '취소', hidden: true })).toHaveAccessibleDescription(
      '공지를 삭제하고 있어요',
    );
  });

  it('삭제 실패 후에는 취소할 수 있고 원래 버튼으로 포커스가 돌아간다', async () => {
    const user = userEvent.setup();
    render(<AdminNoticesScreen />);
    const opener = await screen.findByRole('button', { name: '운영 시간 안내 삭제' });
    await user.click(opener);
    authRequest.mockRejectedValueOnce(new ApiError(403, 'AUTH_ACCESS_DENIED', '오류'));
    const dialog = within(screen.getByRole('dialog', { hidden: true }));

    await user.click(dialog.getByRole('button', { name: '삭제', hidden: true }));
    expect(await dialog.findByRole('alert', { hidden: true })).toHaveTextContent(
      '전체 권한 관리자만 공지를 삭제할 수 있어요',
    );
    await user.click(dialog.getByRole('button', { name: '취소', hidden: true }));

    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('삭제 후 목록 조회가 실패하면 다시 시도 버튼으로 포커스를 옮긴다', async () => {
    const user = userEvent.setup();
    render(<AdminNoticesScreen />);
    await user.click(await screen.findByRole('button', { name: '운영 시간 안내 삭제' }));
    authRequest.mockReset();
    authRequest.mockResolvedValueOnce({ noticeId: 7 });
    authRequest.mockRejectedValueOnce(new ApiError(500, 'COMMON_INTERNAL_ERROR', '오류'));
    const dialog = within(screen.getByRole('dialog', { hidden: true }));

    await user.click(dialog.getByRole('button', { name: '삭제', hidden: true }));

    expect(await screen.findByRole('button', { name: '다시 시도' })).toHaveFocus();
  });

  it('지금 페이지가 비면 남은 마지막 페이지를 불러온다', async () => {
    const user = userEvent.setup();
    authRequest.mockResolvedValue(listPage({ totalCount: 21, totalPages: 2 }));
    render(<AdminNoticesScreen />);
    await screen.findByRole('rowheader', { name: '운영 시간 안내' });
    authRequest.mockReset();
    authRequest.mockResolvedValueOnce(listPage({ notices: [], page: 1, totalPages: 1 }));
    authRequest.mockResolvedValueOnce(listPage());

    await user.click(screen.getByRole('button', { name: /2/ }));

    await waitFor(() => expect(authRequest).toHaveBeenLastCalledWith('/api/admin/notices?page=0'));
    expect(await screen.findByRole('rowheader', { name: '운영 시간 안내' })).toBeInTheDocument();
  });

  it('불러오지 못하면 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    authRequest.mockReset();
    authRequest.mockRejectedValueOnce(new ApiError(500, 'COMMON_INTERNAL_ERROR', '오류'));
    authRequest.mockResolvedValueOnce(listPage());
    render(<AdminNoticesScreen />);

    await user.click(await screen.findByRole('button', { name: '다시 시도' }));

    expect(await screen.findByRole('rowheader', { name: '운영 시간 안내' })).toBeInTheDocument();
  });
});
