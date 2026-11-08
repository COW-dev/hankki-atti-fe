import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { passwordChanged } from '@/features/auth/password-changed';
import { PasswordChangeScreen } from '@/features/auth/PasswordChangeScreen';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';

const changePassword = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ changePassword }),
}));

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

// 상단 바의 알림·접근성 연결은 이 테스트 대상이 아니다
vi.mock('@/components/layout/TopBar', () => ({
  TopBar: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const NEW_PASSWORD = 'hankki!2026';

async function fill(user: UserEvent, currentLabel: string) {
  await user.type(screen.getByLabelText(currentLabel), 'old-password!1');
  await user.type(screen.getByLabelText('새 비밀번호'), NEW_PASSWORD);
  await user.type(screen.getByLabelText('새 비밀번호 확인'), NEW_PASSWORD);
}

describe('PasswordChangeScreen', () => {
  beforeEach(() => {
    changePassword.mockReset();
    replace.mockReset();
  });

  afterEach(() => {
    passwordChanged.clear();
  });

  it('첫 로그인이면 강제 변경 안내를 보이고, 바꾸면 첫 화면으로 간다', async () => {
    // given
    const user = userEvent.setup();
    changePassword.mockResolvedValueOnce(undefined);
    render(<PasswordChangeScreen reader="STUDENT" mode="first" />);
    expect(screen.getByRole('heading', { name: '처음 로그인하셨어요' })).toBeInTheDocument();
    expect(screen.getByText('바꾸기 전에는 다른 화면을 쓸 수 없어요')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    // when
    await fill(user, '받은 비밀번호');
    await user.click(screen.getByRole('button', { name: '비밀번호 바꾸기' }));

    // then
    expect(changePassword).toHaveBeenCalledWith('old-password!1', NEW_PASSWORD);
    expect(replace).toHaveBeenCalledWith('/');
    expect(passwordChanged.peek()).toBe(false);
  });

  it('임시 비밀번호로 들어온 도우미에게는 처음 로그인이라고 하지 않는다', () => {
    render(<PasswordChangeScreen reader="HELPER" mode="first" />);

    expect(
      screen.getByRole('heading', { name: '임시 비밀번호로 로그인하셨어요' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('처음 로그인하셨어요')).not.toBeInTheDocument();
  });

  it('마이페이지에서 들어오면 첫 로그인 문구 없이 탭바와 함께 보이고, 바꾸면 마이페이지로 돌아간다', async () => {
    // given
    const user = userEvent.setup();
    changePassword.mockResolvedValueOnce(undefined);
    render(<PasswordChangeScreen reader="HELPER" mode="mypage" />);
    expect(screen.queryByText('처음 로그인하셨어요')).not.toBeInTheDocument();
    expect(screen.queryByText('바꾸기 전에는 다른 화면을 쓸 수 없어요')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '마이페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    // when
    await fill(user, '현재 비밀번호');
    await user.click(screen.getByRole('button', { name: '비밀번호 바꾸기' }));

    // then
    expect(replace).toHaveBeenCalledWith('/helper/mypage');
    expect(passwordChanged.peek()).toBe(true);
  });

  it('조건을 채우기 전에는 버튼이 눌리지 않고 남은 조건을 읽어 준다', async () => {
    // given
    const user = userEvent.setup();
    render(<PasswordChangeScreen reader="STUDENT" mode="mypage" />);
    const button = screen.getByRole('button', { name: '비밀번호 바꾸기' });

    // when
    await user.click(button);

    // then
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAccessibleDescription(/조건 \d+개 남음/);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('현재 비밀번호가 틀리면 그 칸에 오류를 보인다', async () => {
    // given
    const user = userEvent.setup();
    changePassword.mockRejectedValueOnce(
      new ApiError(400, ErrorCode.CURRENT_PASSWORD_MISMATCH, '틀렸어요'),
    );
    render(<PasswordChangeScreen reader="STUDENT" mode="mypage" />);

    // when
    await fill(user, '현재 비밀번호');
    await user.click(screen.getByRole('button', { name: '비밀번호 바꾸기' }));

    // then
    expect(await screen.findByLabelText('현재 비밀번호')).toHaveAccessibleDescription(
      '현재 비밀번호가 맞지 않아요',
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('지금 비밀번호와 같으면 새 비밀번호 칸에 오류를 보이고, 고치면 지운다', async () => {
    // given
    const user = userEvent.setup();
    changePassword.mockRejectedValueOnce(
      new ApiError(422, ErrorCode.SAME_AS_CURRENT_PASSWORD, '같아요'),
    );
    render(<PasswordChangeScreen reader="STUDENT" mode="first" />);

    // when
    await fill(user, '받은 비밀번호');
    await user.click(screen.getByRole('button', { name: '비밀번호 바꾸기' }));

    // then
    expect(
      await screen.findByText('지금 쓰는 비밀번호와 다르게 만들어 주세요'),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('새 비밀번호'), '9');
    expect(screen.queryByText('지금 쓰는 비밀번호와 다르게 만들어 주세요')).not.toBeInTheDocument();
  });

  it('로그인이 만료됐으면 로그인 화면으로 보낸다', async () => {
    // given
    const user = userEvent.setup();
    changePassword.mockRejectedValueOnce(new ApiError(401, ErrorCode.UNAUTHENTICATED, '만료'));
    render(<PasswordChangeScreen reader="HELPER" mode="mypage" />);

    // when
    await fill(user, '현재 비밀번호');
    await user.click(screen.getByRole('button', { name: '비밀번호 바꾸기' }));

    // then
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
