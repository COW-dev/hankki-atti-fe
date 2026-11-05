import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelperDetailScreen } from '@/features/helpers/HelperDetailScreen';
import type {
  AdminHelperActivity,
  AdminHelperDeactivationPreview,
  AdminHelperDetail,
} from '@/features/helpers/types';
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

const helper: AdminHelperDetail = {
  helperId: 5,
  name: '윤태호',
  studentNo: '20213333',
  status: 'ACTIVE',
  attiMember: true,
  email: 'yunth@mju.ac.kr',
  phone: '010-3333-3333',
  kakaoId: 'taeho_y',
  joinedAt: '2026-09-11T10:00:00',
  summary: {
    matchedCount: 5,
    completedCount: 2,
    volunteerHours: 2.5,
    canceledCount: 2,
    noShowCount: 1,
  },
};

const completed: AdminHelperActivity = {
  applicationId: 31,
  helpRequestId: 2,
  startAt: '2026-09-22T11:30:00',
  studentId: 3,
  studentName: '최도윤',
  status: 'COMPLETED',
  cancelReason: null,
  cancelReasonDetail: null,
  canceledAt: null,
  minutesBeforeMeal: null,
  minutesAfterCompletion: null,
  afterAction: null,
  promotedWaitingOrder: null,
  requestStatus: 'COMPLETED',
  volunteerHours: 1,
  volunteerHourChanges: [],
};

const preview: AdminHelperDeactivationPreview = {
  helperId: 5,
  alreadyInactive: false,
  matchedCount: 1,
  waitingCount: 0,
  targets: [
    {
      applicationId: 41,
      helpRequestId: 4,
      startAt: '2026-09-30T12:00:00',
      studentName: '이서준',
      status: 'MATCHED',
      waitingOrder: null,
    },
  ],
};

const nothingLeft: AdminHelperDeactivationPreview = {
  ...preview,
  alreadyInactive: true,
  matchedCount: 0,
  targets: [],
};

const EDIT_NAME = '09.22(화) 11:30 최도윤 봉사시간 수정';

type Responses = Record<string, unknown>;

// 주소별 응답. 값이 Error면 실패시킨다
function serve(responses: Responses = {}) {
  authRequest.mockImplementation(async (path: string) => {
    const table: Responses = {
      '/api/admin/helpers/5': helper,
      '/api/admin/helpers/5/activities': [completed],
      ...responses,
    };
    const value = table[path];
    if (value instanceof Error) throw value;
    return value;
  });
}

describe('HelperDetailScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    guard.me = admin('FULL');
    serve();
  });

  it('프로필·요약·활동 이력을 보인다', async () => {
    render(<HelperDetailScreen helperId={5} />);

    expect(await screen.findByRole('heading', { level: 1, name: '윤태호' })).toBeInTheDocument();
    expect(screen.getByText('아띠 (자기신고)')).toBeInTheDocument();
    expect(screen.getByText(/연락 정보는 도우미가 직접/)).toHaveTextContent('yunth@mju.ac.kr');
    expect(screen.getByText('봉사시간 합계').nextElementSibling).toHaveTextContent('2.5시간');
    expect(screen.getByRole('table', { name: '활동 이력' })).toBeInTheDocument();
  });

  it('제한 권한이면 봉사시간 수정 버튼이 없다', async () => {
    guard.me = admin('LIMITED');

    render(<HelperDetailScreen helperId={5} />);

    await screen.findByRole('heading', { level: 1, name: '윤태호' });
    expect(screen.queryByRole('button', { name: EDIT_NAME })).not.toBeInTheDocument();
  });

  it('이용 완료가 아닌 행에는 수정 버튼이 없다', async () => {
    serve({
      '/api/admin/helpers/5/activities': [{ ...completed, status: 'NO_SHOW', volunteerHours: 0 }],
    });

    render(<HelperDetailScreen helperId={5} />);

    await screen.findByRole('heading', { level: 1, name: '윤태호' });
    expect(screen.queryByRole('button', { name: /봉사시간 수정/ })).not.toBeInTheDocument();
  });

  it('없는 도우미면 찾을 수 없다고 알린다', async () => {
    serve({ '/api/admin/helpers/5': new ApiError(404, 'HELPER_NOT_FOUND', '없음') });

    render(<HelperDetailScreen helperId={5} />);

    expect(await screen.findByText('도우미를 찾을 수 없어요')).toBeInTheDocument();
  });

  it('임시 비밀번호를 보내면 토스트로 알린다', async () => {
    const user = userEvent.setup();
    serve({ '/api/admin/helpers/5/temporary-password': { helperId: 5, email: helper.email } });
    render(<HelperDetailScreen helperId={5} />);

    await user.click(await screen.findByRole('button', { name: '임시 비밀번호 발송' }));

    expect(await screen.findByText('임시 비밀번호를 보냈어요')).toBeInTheDocument();
  });

  it('비활성 계정은 임시 비밀번호·비활성화 대신 다시 활성화를 둔다', async () => {
    const user = userEvent.setup();
    serve({
      '/api/admin/helpers/5': { ...helper, status: 'INACTIVE' },
      '/api/admin/helpers/5/deactivation-preview': nothingLeft,
      '/api/admin/helpers/5/activate': { helperId: 5, status: 'ACTIVE' },
    });
    render(<HelperDetailScreen helperId={5} />);

    const activate = await screen.findByRole('button', { name: '다시 활성화' });
    expect(screen.queryByRole('button', { name: '임시 비밀번호 발송' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '계정 비활성화' })).not.toBeInTheDocument();

    await user.click(activate);

    expect(authRequest).toHaveBeenCalledWith('/api/admin/helpers/5/activate', { method: 'POST' });
    expect(await screen.findByText('계정을 다시 활성화했어요')).toBeInTheDocument();
  });

  it('활성 계정은 남은 건을 조회하지 않는다', async () => {
    render(<HelperDetailScreen helperId={5} />);

    await screen.findByRole('heading', { level: 1, name: '윤태호' });
    expect(authRequest).not.toHaveBeenCalledWith('/api/admin/helpers/5/deactivation-preview');
  });

  describe('비활성 계정의 남은 건', () => {
    const inactive = { ...helper, status: 'INACTIVE' };
    const left = { ...preview, alreadyInactive: true };

    it('남은 건이 없으면 경고와 정리 버튼이 없다', async () => {
      serve({
        '/api/admin/helpers/5': inactive,
        '/api/admin/helpers/5/deactivation-preview': nothingLeft,
      });

      render(<HelperDetailScreen helperId={5} />);

      await screen.findByRole('button', { name: '다시 활성화' });
      expect(screen.queryByText(/처리하지 못한/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /정리/ })).not.toBeInTheDocument();
    });

    it('남은 건이 있으면 알리고 정리하면 경고가 사라진다', async () => {
      const user = userEvent.setup();
      let current = left;
      authRequest.mockImplementation(async (path: string) => {
        if (path === '/api/admin/helpers/5') return inactive;
        if (path.endsWith('/activities')) return [];
        if (path.endsWith('/deactivation-preview')) return current;
        current = nothingLeft;
        return { helperId: 5, status: 'INACTIVE', remainingCount: 0 };
      });
      render(<HelperDetailScreen helperId={5} />);

      expect(
        await screen.findByText('처리하지 못한 매칭·예비 1건이 남아 있어요'),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '남은 1건 정리' }));
      const dialog = within(
        await screen.findByRole('dialog', { name: '윤태호 도우미의 남은 건을 정리할까요?' }),
      );
      await dialog.findByRole('listitem');
      await user.click(dialog.getByRole('button', { name: '정리' }));

      expect(authRequest).toHaveBeenCalledWith('/api/admin/helpers/5/deactivate', {
        method: 'POST',
      });
      expect(await screen.findByText('남은 건을 정리했어요')).toBeInTheDocument();
      await vi.waitFor(() => expect(screen.queryByText(/처리하지 못한/)).not.toBeInTheDocument());
    });

    it('남은 건을 확인하지 못하면 없는 것처럼 두지 않고 오류를 알린다', async () => {
      serve({
        '/api/admin/helpers/5': inactive,
        '/api/admin/helpers/5/deactivation-preview': new Error('실패'),
      });

      render(<HelperDetailScreen helperId={5} />);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        '남은 매칭·예비를 확인하지 못했어요',
      );
      expect(screen.getByRole('table', { name: '활동 이력' })).toBeInTheDocument();
    });
  });

  describe('봉사시간 수정', () => {
    const open = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(await screen.findByRole('button', { name: EDIT_NAME }));
      return within(await screen.findByRole('dialog', { name: '봉사시간 수정' }));
    };

    it('값을 바꾸고 사유를 쓰기 전에는 저장되지 않고 이유를 읽어 준다', async () => {
      const user = userEvent.setup();
      render(<HelperDetailScreen helperId={5} />);
      const dialog = await open(user);

      await user.click(dialog.getByRole('button', { name: '저장' }));

      expect(dialog.getByRole('button', { name: '저장' })).toHaveAccessibleDescription(
        '봉사시간을 바꿔 주세요',
      );
      expect(authRequest).not.toHaveBeenCalledWith(
        expect.stringContaining('volunteer-hours'),
        expect.anything(),
      );
    });

    it('화살표 키로 0.5시간씩 바꾸고 저장하면 다시 불러온다', async () => {
      const user = userEvent.setup();
      serve({ '/api/admin/applications/31/volunteer-hours': {} });
      render(<HelperDetailScreen helperId={5} />);
      const dialog = await open(user);

      dialog.getByRole('spinbutton', { name: '봉사시간' }).focus();
      await user.keyboard('{ArrowUp}');
      expect(dialog.getByRole('spinbutton')).toHaveAttribute('aria-valuetext', '1.5시간');
      await user.type(dialog.getByLabelText(/수정 사유/), '30분 길었어요');
      await user.click(dialog.getByRole('button', { name: '저장' }));

      expect(authRequest).toHaveBeenCalledWith('/api/admin/applications/31/volunteer-hours', {
        method: 'PATCH',
        body: { hours: 1.5, reason: '30분 길었어요' },
      });
      expect(await screen.findByText('봉사시간을 수정했어요')).toBeInTheDocument();
      expect(
        authRequest.mock.calls.filter(([path]) => path === '/api/admin/helpers/5'),
      ).toHaveLength(2);
    });

    it('이미 같은 값이면 알리고 표를 다시 불러온다', async () => {
      const user = userEvent.setup();
      serve({
        '/api/admin/applications/31/volunteer-hours': new ApiError(
          422,
          'APPLICATION_VOLUNTEER_HOURS_UNCHANGED',
          '같음',
        ),
      });
      render(<HelperDetailScreen helperId={5} />);
      const dialog = await open(user);

      await user.click(dialog.getByRole('button', { name: '봉사시간 0.5시간 늘리기' }));
      await user.type(dialog.getByLabelText(/수정 사유/), '사유');
      await user.click(dialog.getByRole('button', { name: '저장' }));

      expect(await dialog.findByRole('alert')).toHaveTextContent('지금 봉사시간과 같아요');
      expect(
        authRequest.mock.calls.filter(([path]) => path === '/api/admin/helpers/5'),
      ).toHaveLength(2);
    });

    it('최근 수정 내역을 보인다', async () => {
      const user = userEvent.setup();
      serve({
        '/api/admin/helpers/5/activities': [
          {
            ...completed,
            volunteerHours: 1.5,
            volunteerHourChanges: [
              {
                changeId: 1,
                beforeHours: 1,
                afterHours: 1.5,
                reason: '30분 길었어요',
                adminName: '김센터',
                changedAt: '2026-10-11T15:00:00',
              },
            ],
          },
        ],
      });
      render(<HelperDetailScreen helperId={5} />);

      expect(await screen.findByText('수정됨')).toBeInTheDocument();
      const dialog = await open(user);

      expect(
        dialog.getByText('최근 수정 · 1시간 → 1.5시간 · 김센터 · 10.11 15:00 · 30분 길었어요'),
      ).toBeInTheDocument();
    });
  });

  describe('비활성화', () => {
    const open = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(await screen.findByRole('button', { name: '계정 비활성화' }));
      return within(
        await screen.findByRole('dialog', { name: '윤태호 도우미 계정을 비활성화할까요?' }),
      );
    };

    it('풀릴 건을 보여 주고 확인하면 비활성화한다', async () => {
      const user = userEvent.setup();
      serve({
        '/api/admin/helpers/5/deactivation-preview': preview,
        '/api/admin/helpers/5/deactivate': { helperId: 5, status: 'INACTIVE', remainingCount: 0 },
      });
      render(<HelperDetailScreen helperId={5} />);
      const dialog = await open(user);

      expect(await dialog.findByText('진행 중 매칭 1건, 예비 0건이 풀려요')).toBeInTheDocument();
      expect(dialog.getByRole('listitem')).toHaveTextContent('09.30(수) 12:00 이서준');

      await user.click(dialog.getByRole('button', { name: '비활성화' }));

      expect(await screen.findByText('계정을 비활성화했어요')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('일부를 처리하지 못하면 창을 열어 둔 채 다시 시도하게 한다', async () => {
      const user = userEvent.setup();
      serve({
        '/api/admin/helpers/5/deactivation-preview': preview,
        '/api/admin/helpers/5/deactivate': { helperId: 5, status: 'INACTIVE', remainingCount: 1 },
      });
      render(<HelperDetailScreen helperId={5} />);
      const dialog = await open(user);
      await dialog.findByRole('listitem');

      await user.click(dialog.getByRole('button', { name: '비활성화' }));

      expect(await dialog.findByRole('alert')).toHaveTextContent('1건을 처리하지 못했어요');
      expect(dialog.getByRole('button', { name: '비활성화' })).toBeInTheDocument();
    });
  });
});
