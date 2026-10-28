import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationTopBar } from '@/features/notifications/NotificationTopBar';
import type { AppNotification } from '@/features/notifications/types';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest }),
}));

// 큰 글씨 토글은 이 테스트 대상이 아니고, 테스트 환경의 Node localStorage가 jsdom 것을 가린다
vi.mock('@/components/ui/A11yToggle', () => ({ A11yToggle: () => null }));

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
}));

function notification(
  id: number,
  message: string,
  targetType: AppNotification['targetType'],
): AppNotification {
  return {
    id,
    type: targetType === 'NOTICE' ? 'NOTICE_PUBLISHED' : 'APPLICATION_MATCHED',
    message,
    targetType,
    targetId: id,
    read: false,
    createdAt: '2026-10-28T12:00:00',
  };
}

const ITEMS = [
  notification(2, '10/7 12:00 매칭됐어요', 'APPLICATION'),
  notification(1, '새 공지가 올라왔어요', 'NOTICE'),
];

function serve(path: string) {
  if (path === '/api/notifications/unread-count') return Promise.resolve({ count: 2 });
  if (path === '/api/notifications') return Promise.resolve({ items: ITEMS, nextCursor: null });
  return Promise.resolve({});
}

async function renderOpened() {
  const user = userEvent.setup();
  render(<NotificationTopBar title="매칭 현황" logo />);
  const bell = await screen.findByRole('button', { name: '알림, 안 읽은 알림 2개' });
  await user.click(bell);
  await screen.findByRole('button', { name: /10\/7 12:00 매칭됐어요/ });
  return { user, bell };
}

describe('NotificationTopBar', () => {
  beforeEach(() => {
    authRequest.mockReset();
    authRequest.mockImplementation(serve);
    push.mockReset();
    // 상대 시각을 고정한다 (알림 시각 12:00 → 2시간 전). 타이머는 실제로 둔다
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 28, 14, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('벨 이름에 안 읽은 개수를 넣고, 누르면 패널을 열어 제목으로 포커스를 옮긴다', async () => {
    const { bell } = await renderOpened();

    expect(bell).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('heading', { level: 2, name: '알림' })).toHaveFocus();
    expect(
      screen.getByRole('button', { name: '안 읽음, 10/7 12:00 매칭됐어요, 2시간 전' }),
    ).toBeInTheDocument();
  });

  it('Esc를 누르면 패널을 닫고 벨로 포커스를 돌려보낸다', async () => {
    const { user, bell } = await renderOpened();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('heading', { level: 2, name: '알림' })).not.toBeInTheDocument();
    expect(bell).toHaveAttribute('aria-expanded', 'false');
    expect(bell).toHaveFocus();
  });

  it('패널에서 Tab으로 본문까지 나가면 패널을 닫고 포커스는 본문에 둔다', async () => {
    // given: 상단 바 아래 본문 버튼
    const user = userEvent.setup();
    render(
      <>
        <NotificationTopBar title="매칭 현황" logo />
        <button type="button">본문 버튼</button>
      </>,
    );
    await user.click(await screen.findByRole('button', { name: '알림, 안 읽은 알림 2개' }));
    await screen.findByRole('button', { name: /10\/7 12:00 매칭됐어요/ });

    // when: 모두 읽음 → 알림 두 건 → 본문
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();

    // then
    expect(screen.getByRole('button', { name: '본문 버튼' })).toHaveFocus();
    expect(screen.queryByRole('heading', { level: 2, name: '알림' })).not.toBeInTheDocument();
  });

  it('지원 알림을 누르면 읽음으로 바꾸고 매칭 현황으로 간다', async () => {
    const { user } = await renderOpened();

    await user.click(screen.getByRole('button', { name: /10\/7 12:00 매칭됐어요/ }));

    expect(authRequest).toHaveBeenCalledWith('/api/notifications/2/read', { method: 'PATCH' });
    expect(push).toHaveBeenCalledWith('/matches');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '알림, 안 읽은 알림 1개' })).toBeInTheDocument(),
    );
  });

  it('공지 알림을 누르면 읽음으로 바꾸고 그 공지의 상세로 간다', async () => {
    const { user } = await renderOpened();

    await user.click(screen.getByRole('button', { name: /새 공지가 올라왔어요/ }));

    expect(authRequest).toHaveBeenCalledWith('/api/notifications/1/read', { method: 'PATCH' });
    expect(push).toHaveBeenCalledWith('/notices/1');
  });
});
