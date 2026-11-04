import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentsScreen } from '@/features/students/StudentsScreen';
import type { AdminStudentPage } from '@/features/students/types';
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

const page = (name: string): AdminStudentPage => ({
  students: [
    {
      accountId: 7,
      name,
      studentNo: '20231234',
      status: 'ACTIVE',
      recentRequestAt: null,
    },
  ],
  page: 0,
  size: 20,
  totalCount: 1,
  totalPages: 1,
});

describe('StudentsScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    guard.me = admin('FULL');
  });

  it('제한 권한이면 안내를 보이고 등록 버튼·장애 유형 필터·연락처 열을 그리지 않는다', async () => {
    guard.me = admin('LIMITED');
    authRequest.mockResolvedValue(page('김민지'));

    render(<StudentsScreen />);

    expect(await screen.findByRole('button', { name: '김민지 상세' })).toBeInTheDocument();
    expect(screen.getByText(/민감 정보는 보이지 않아요/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '+ 학생 등록' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: '장애 유형' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: '전화번호' })).not.toBeInTheDocument();
  });

  it('조건을 바꾼 조회가 실패하면 이전 결과를 숨기고, 다시 시도하면 새 결과를 보인다', async () => {
    // given: 첫 조회 성공 뒤 상태를 바꾼 조회가 실패
    authRequest
      .mockResolvedValueOnce(page('김민지'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(page('정유나'));
    const user = userEvent.setup();
    render(<StudentsScreen />);
    await screen.findByRole('button', { name: '김민지 상세' });

    // when
    await user.selectOptions(screen.getByRole('combobox', { name: '상태' }), 'INACTIVE');

    // then
    expect(await screen.findByRole('alert')).toHaveTextContent('학생 목록을 불러오지 못했어요');
    expect(screen.queryByRole('button', { name: '김민지 상세' })).not.toBeInTheDocument();
    expect(screen.queryByText('총 1명')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByRole('button', { name: '정유나 상세' })).toBeInTheDocument();
    expect(authRequest).toHaveBeenLastCalledWith('/api/admin/students?page=0&status=INACTIVE');
  });

  it('아직 없는 화면으로 가는 동작은 화면을 벗어나지 않고 준비 중이라고 알린다', async () => {
    authRequest.mockResolvedValue(page('김민지'));
    const user = userEvent.setup();
    render(<StudentsScreen />);

    await user.click(await screen.findByRole('button', { name: '김민지 상세' }));

    expect(await screen.findByText('준비 중인 화면이에요')).toBeInTheDocument();
  });
});
