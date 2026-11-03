import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLoginScreen } from '@/features/auth/AdminLoginScreen';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';

const login = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ login }),
}));

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

async function submit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('아이디'), ' admin01 ');
  await user.type(screen.getByLabelText('비밀번호'), 'password!1');
  await user.click(screen.getByRole('button', { name: '로그인' }));
}

describe('AdminLoginScreen', () => {
  beforeEach(() => {
    login.mockReset();
    replace.mockReset();
  });

  it('로그인에 성공하면 앞뒤 공백을 뺀 아이디로 로그인하고 관리자 홈으로 간다', async () => {
    // given
    login.mockResolvedValue({ role: 'ADMIN', mustChangePassword: false });
    render(<AdminLoginScreen />);

    // when
    await submit();

    // then
    expect(login).toHaveBeenCalledWith('admin01', 'password!1');
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('아이디나 비밀번호가 틀리면 오류를 바로 읽어 주고 비밀번호 칸에 이유를 연결한다', async () => {
    login.mockRejectedValue(new ApiError(401, ErrorCode.LOGIN_FAILED, '실패'));
    render(<AdminLoginScreen />);

    await submit();

    const alerts = await screen.findAllByRole('alert');
    expect(alerts[0]).toHaveTextContent('아이디 또는 비밀번호가 맞지 않아요');
    expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
      expect.stringContaining('비밀번호를 다시 확인해 주세요'),
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('사용이 중지된 계정이면 센터 문의 안내를 보여 준다', async () => {
    login.mockRejectedValue(new ApiError(403, ErrorCode.ACCOUNT_DEACTIVATED, '중지'));
    render(<AdminLoginScreen />);

    await submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '사용이 중지된 계정이에요. 센터(02-300-1529)로 문의해 주세요',
    );
  });

  it('가입·비밀번호 찾기 링크를 두지 않는다', () => {
    render(<AdminLoginScreen />);

    expect(screen.getByRole('heading', { level: 1, name: '관리자 로그인' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
