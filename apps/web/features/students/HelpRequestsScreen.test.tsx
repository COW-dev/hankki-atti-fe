import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelpRequestsScreen } from '@/features/students/HelpRequestsScreen';
import type { AdminHelpRequest } from '@/features/students/types';
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

const admin = (grade: AdminMe['grade']): AdminMe => ({
  accountId: 1,
  loginId: 'center01',
  name: '홍길동',
  grade,
  role: 'ADMIN',
  accessibilityMode: false,
});

const request: AdminHelpRequest = {
  id: 3,
  startAt: '2026-09-29T12:30:00',
  endAt: '2026-09-29T13:30:00',
  status: 'MATCHED',
  helpTypes: ['SERVING'],
  cancelType: null,
  student: { id: 7, name: '이서준', studentNo: '60231234' },
  helper: { id: 9, name: '한지우' },
  promotionPending: false,
  helperChanged: false,
  waitingCount: 2,
  requestedAt: '2026-09-27T20:41:00',
  firstMatchedAt: '2026-09-27T20:55:00',
  minutesToMatch: 14,
};

const summary = { total: 1, matched: 1, recruiting: 0, failed: 0, noShow: 0 };

// 목록과 요약을 경로로 나눠 돌려준다
function respond(requests: AdminHelpRequest[]) {
  authRequest.mockImplementation((path: string) =>
    Promise.resolve(path.includes('/summary') ? summary : requests),
  );
}

describe('HelpRequestsScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    guard.me = admin('FULL');
  });

  it('신청을 식사 일시·매칭까지 걸린 시간과 함께 보이고 건수를 알린다', async () => {
    respond([request]);

    render(<HelpRequestsScreen />);

    expect(
      await screen.findByRole('button', { name: '이서준 09.29(화) 12:30 상세' }),
    ).toBeInTheDocument();
    expect(screen.getByText('09.27 20:55 (14분)')).toBeInTheDocument();
    expect(screen.getByText('2명')).toBeInTheDocument();
    expect(screen.getByText('1건 표시')).toHaveAttribute('role', 'status');
    expect(screen.getByRole('link', { name: '전체 신청 현황' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('제한 권한이면 안내를 보이고 장애 유형 열을 그리지 않는다', async () => {
    guard.me = admin('LIMITED');
    respond([request]);

    render(<HelpRequestsScreen />);

    await screen.findByRole('button', { name: /이서준/ });
    expect(screen.getByText(/민감 정보는 보이지 않아요/)).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: '장애 유형' })).not.toBeInTheDocument();
  });

  it('기간이 너무 길면 기간 안내를 보인다', async () => {
    authRequest.mockRejectedValue(
      new ApiError(400, 'HELP_REQUEST_INVALID_DATE_RANGE', '조회 기간 오류'),
    );

    render(<HelpRequestsScreen />);

    expect(await screen.findByRole('alert')).toHaveTextContent('기간은 31일 안에서 골라 주세요');
  });
});
