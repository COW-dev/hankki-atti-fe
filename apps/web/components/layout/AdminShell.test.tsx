import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminShell } from '@/components/layout/AdminShell';
import type { AdminMe } from '@/lib/auth/useSessionGuard';

const logout = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ logout }),
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

describe('AdminShell', () => {
  beforeEach(() => {
    logout.mockReset();
    guard.me = admin('FULL');
  });

  it('관리자 확인 전이면 아무것도 그리지 않는다', () => {
    guard.me = null;
    render(
      <AdminShell active="/students" title="제목">
        본문
      </AdminShell>,
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByText('본문')).not.toBeInTheDocument();
  });

  it('관리자 확인이 끝나 화면이 보이면 제목으로 포커스를 옮긴다', () => {
    // given 확인 전
    guard.me = null;
    const { rerender } = render(<AdminShell active="/students" title="장애학생 관리" />);

    // when
    guard.me = admin('FULL');
    rerender(<AdminShell active="/students" title="장애학생 관리" />);

    // then
    expect(screen.getByRole('heading', { level: 1, name: '장애학생 관리' })).toHaveFocus();
  });

  it('메뉴로 다른 화면에 가면 새 화면 제목으로 포커스를 옮긴다', () => {
    // given 장애학생 화면에서 도우미 메뉴에 포커스
    const { rerender } = render(<AdminShell active="/students" title="장애학생 관리" />);
    screen.getByRole('link', { name: '도우미' }).focus();

    // when
    rerender(<AdminShell active="/helpers" title="도우미 관리" />);

    // then
    expect(screen.getByRole('heading', { level: 1, name: '도우미 관리' })).toHaveFocus();
  });

  it('현재 메뉴만 현재 페이지로 알린다', () => {
    render(
      <AdminShell active="/helpers" title="제목">
        본문
      </AdminShell>,
    );

    const nav = screen.getByRole('navigation', { name: '관리자 메뉴' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '도우미' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '장애학생' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: '공지사항' })).not.toHaveAttribute('aria-current');
  });

  it('첫 링크는 본문으로 건너뛰기다', () => {
    render(
      <AdminShell active="/students" title="제목">
        본문
      </AdminShell>,
    );

    const [first] = screen.getAllByRole('link');
    expect(first).toHaveTextContent('본문으로 건너뛰기');
    expect(first).toHaveAttribute('href', '#admin-main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'admin-main');
  });

  it.each([
    ['FULL', '전체 권한'],
    ['LIMITED', '제한 권한'],
  ] as const)('%s 등급이면 이름과 "%s" 태그를 보여 준다', (grade, label) => {
    guard.me = admin(grade);
    render(
      <AdminShell active="/students" title="제목">
        본문
      </AdminShell>,
    );

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('로그아웃을 누르면 로그아웃한다', async () => {
    render(
      <AdminShell active="/students" title="제목">
        본문
      </AdminShell>,
    );

    await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(logout).toHaveBeenCalledOnce();
  });
});
