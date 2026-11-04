import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentCreateScreen } from '@/features/students/StudentCreateScreen';
import type { AdminStudentCreated } from '@/features/students/types';
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

const created = (credentialMailStatus: AdminStudentCreated['credentialMailStatus']) => ({
  accountId: 7,
  loginId: '60231234',
  name: '김민지',
  studentNo: '60231234',
  schoolEmail: '60231234@mju.ac.kr',
  disabilityType: 'VISUAL',
  credentialMailStatus,
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: '이름 *' }), '김민지');
  await user.type(screen.getByRole('textbox', { name: '학번 *' }), '60231234');
  await user.type(screen.getByRole('textbox', { name: '전화번호 *' }), '010-1234-5678');
  await user.type(screen.getByRole('textbox', { name: '카톡 ID *' }), 'minji_k');
  await user.type(screen.getByRole('textbox', { name: '학교 이메일 *' }), '60231234@mju.ac.kr');
  await user.selectOptions(screen.getByRole('combobox', { name: '장애 유형 *' }), 'VISUAL');
}

describe('StudentCreateScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    guard.me = admin('FULL');
  });

  it('제한 권한이면 입력 폼 대신 안내만 보인다', () => {
    guard.me = admin('LIMITED');

    render(<StudentCreateScreen />);

    expect(screen.getByText('전체 권한 관리자만 학생을 등록할 수 있어요')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '이름 *' })).not.toBeInTheDocument();
  });

  it('빈 채로 제출하면 오류 개수를 알리고 첫 칸으로 포커스하며 서버에 보내지 않는다', async () => {
    const user = userEvent.setup();
    render(<StudentCreateScreen />);

    await user.click(screen.getByRole('button', { name: '등록하고 계정정보 보내기' }));

    expect(screen.getByText('입력한 내용을 확인해 주세요 (6곳)')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '이름 *' })).toHaveFocus();
    expect(authRequest).not.toHaveBeenCalled();
  });

  it('학번이 중복이면 학번 칸 오류로 보이고 그 칸으로 포커스한다', async () => {
    // given
    authRequest.mockRejectedValue(new ApiError(409, 'STUDENT_DUPLICATE_STUDENT_NO', '중복'));
    const user = userEvent.setup();
    render(<StudentCreateScreen />);
    await fillValidForm(user);

    // when
    await user.click(screen.getByRole('button', { name: '등록하고 계정정보 보내기' }));

    // then
    const studentNo = screen.getByRole('textbox', { name: '학번 *' });
    expect(studentNo).toHaveAccessibleDescription('이미 등록된 학번이에요');
    expect(studentNo).toHaveFocus();
  });

  it('등록하면 가린 이메일로 결과를 보이고 결과 제목으로 포커스하며, 다른 학생 등록은 빈 폼을 연다', async () => {
    // given
    authRequest.mockResolvedValue(created('PENDING'));
    const user = userEvent.setup();
    render(<StudentCreateScreen />);
    await fillValidForm(user);

    // when
    await user.click(screen.getByRole('button', { name: '등록하고 계정정보 보내기' }));

    // then
    expect(await screen.findByRole('heading', { name: '김민지 학생을 등록했어요' })).toHaveFocus();
    expect(screen.getByText('6023****@mju.ac.kr')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '학생 목록으로' })).toHaveAttribute(
      'href',
      '/students',
    );

    await user.click(screen.getByRole('button', { name: '다른 학생 등록' }));
    expect(screen.getByRole('textbox', { name: '이름 *' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: '이름 *' })).toHaveFocus();
  });

  it('메일 발송에 실패했으면 재발송을 제공하고, 다시 보내면 완료 결과로 바뀐다', async () => {
    // given
    authRequest.mockResolvedValueOnce(created('FAILED')).mockResolvedValueOnce({
      accountId: 7,
      loginId: '60231234',
      schoolEmail: '60231234@mju.ac.kr',
      credentialMailStatus: 'PENDING',
    });
    const user = userEvent.setup();
    render(<StudentCreateScreen />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: '등록하고 계정정보 보내기' }));
    await screen.findByRole('heading', { name: '등록은 됐지만 메일을 보내지 못했어요' });

    // when
    await user.click(screen.getByRole('button', { name: '계정정보 다시 보내기' }));

    // then
    expect(authRequest).toHaveBeenLastCalledWith('/api/admin/students/7/credentials', {
      method: 'POST',
    });
    expect(await screen.findByRole('heading', { name: '김민지 학생을 등록했어요' })).toHaveFocus();
  });
});
