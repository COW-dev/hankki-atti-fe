import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelpersScreen } from '@/features/helpers/HelpersScreen';
import type { AdminHelperPage } from '@/features/helpers/types';
import type { AdminMe } from '@/lib/auth/useSessionGuard';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest, logout: vi.fn() }),
}));

const me: AdminMe = {
  accountId: 1,
  loginId: 'center01',
  name: '홍길동',
  grade: 'LIMITED',
  role: 'ADMIN',
  accessibilityMode: false,
};
vi.mock('@/lib/auth/useSessionGuard', () => ({ useSessionGuard: () => me }));

const page: AdminHelperPage = {
  helpers: [
    {
      helperId: 5,
      name: '윤태호',
      studentNo: '20213333',
      maskedEmail: 'yu***@mju.ac.kr',
      maskedPhone: '010-****-3333',
      maskedKakaoId: 'ta***',
      attiMember: true,
      joinedAt: '2026-09-11T10:00:00',
      status: 'ACTIVE',
      completedCount: 2,
    },
  ],
  page: 0,
  size: 20,
  totalCount: 1,
  totalPages: 1,
};

describe('HelpersScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    authRequest.mockResolvedValue(page);
  });

  it('행을 상세로 잇고 가린 전화번호는 끝자리로 읽어 준다', async () => {
    render(<HelpersScreen />);

    const link = await screen.findByRole('link', { name: '윤태호 상세' });
    expect(link).toHaveAttribute('href', '/helpers/5');
    const row = within(link.closest('tr') as HTMLElement);
    expect(row.getByText('끝자리 3333')).toBeInTheDocument();
    expect(row.getByText('예 (자기신고)')).toBeInTheDocument();
    expect(row.getByText('2건')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('가입 승인 없이 바로 이용 · 총 1명');
  });

  it('아띠 소속을 고르면 첫 페이지부터 다시 불러온다', async () => {
    const user = userEvent.setup();
    render(<HelpersScreen />);
    await screen.findByRole('link', { name: '윤태호 상세' });

    await user.selectOptions(screen.getByLabelText('아띠 소속'), 'true');

    expect(authRequest).toHaveBeenLastCalledWith('/api/admin/helpers?page=0&attiMember=true');
  });

  it('불러오지 못하면 오류를 알리고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    authRequest.mockRejectedValueOnce(new Error('실패'));
    render(<HelpersScreen />);

    expect(await screen.findByRole('alert')).toHaveTextContent('도우미 목록을 불러오지 못했어요');

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByRole('link', { name: '윤태호 상세' })).toBeInTheDocument();
  });
});
