import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentDetailScreen } from '@/features/students/StudentDetailScreen';
import type { AdminStudentHelpRequests } from '@/features/students/types';
import { ApiError } from '@/lib/api/client';
import type { AdminMe } from '@/lib/auth/useSessionGuard';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest, logout: vi.fn() }),
}));

const guard = vi.hoisted(() => ({ me: null as AdminMe | null }));
vi.mock('@/lib/auth/useSessionGuard', () => ({
  useSessionGuard: () => guard.me,
}));

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

const admin = (grade: AdminMe['grade']): AdminMe => ({
  accountId: 1,
  loginId: 'center01',
  name: '홍길동',
  grade,
  role: 'ADMIN',
  accessibilityMode: false,
});

const helpRequests: AdminStudentHelpRequests = {
  student: { id: 7, name: '김민지', studentNo: '20231234', status: 'ACTIVE' },
  helpRequests: [
    {
      id: 11,
      startAt: '2026-09-29T12:00:00',
      endAt: '2026-09-29T13:00:00',
      status: 'RECRUITING',
      helpTypes: ['SERVING'],
      cancelType: null,
      helper: null,
      promotedWaitingOrder: null,
      promoted: false,
      promotionPending: false,
      helperChanged: false,
      requestedAt: '2026-09-28T09:12:00',
      firstMatchedAt: null,
    },
  ],
};

describe('StudentDetailScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    replace.mockReset();
  });

  it('제한 권한이면 정보 탭과 수정·재발송·비활성화 버튼을 그리지 않는다', async () => {
    guard.me = admin('LIMITED');
    authRequest.mockResolvedValue(helpRequests);

    render(<StudentDetailScreen accountId={7} tab="requests" />);

    expect(await screen.findByRole('heading', { level: 1, name: '김민지' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '매칭현황' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: '정보' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '정보 수정' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '계정 비활성화' })).not.toBeInTheDocument();
  });

  it('제한 권한이 정보 탭으로 들어오면 서버 403을 보고 매칭현황으로 보낸다', async () => {
    guard.me = admin('LIMITED');
    authRequest.mockRejectedValue(new ApiError(403, 'AUTH_ACCESS_DENIED', '권한 없음'));

    render(<StudentDetailScreen accountId={7} tab="info" />);

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/students/7/requests'));
  });

  it('비활성화는 영향 건수를 확인한 뒤 실행하고 상태 태그를 비활성으로 바꾼다', async () => {
    // given
    guard.me = admin('FULL');
    let status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
    authRequest.mockImplementation((path: string) => {
      if (path.endsWith('/deactivation-preview')) {
        return Promise.resolve({ accountId: 7, alreadyInactive: false, activeRequestCount: 1 });
      }
      if (path.endsWith('/deactivate')) {
        status = 'INACTIVE';
        return Promise.resolve({ accountId: 7, status, deactivatedAt: null });
      }
      return Promise.resolve({ ...helpRequests, student: { ...helpRequests.student, status } });
    });
    const user = userEvent.setup();
    render(<StudentDetailScreen accountId={7} tab="requests" />);

    // when
    await user.click(await screen.findByRole('button', { name: '계정 비활성화' }));
    const dialog = await screen.findByRole('dialog', {
      name: '김민지 학생 계정을 비활성화할까요?',
    });
    expect(await screen.findByText('진행 중인 신청 1건이 취소돼요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '비활성화' }));

    // then
    expect(authRequest).toHaveBeenCalledWith('/api/admin/students/7/deactivate', {
      method: 'POST',
    });
    expect(await screen.findByText('계정을 비활성화했어요')).toBeInTheDocument();
    expect(dialog).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '다시 활성화' })).toBeInTheDocument();
    expect(screen.getByText('비활성')).toBeInTheDocument();
  });
});
