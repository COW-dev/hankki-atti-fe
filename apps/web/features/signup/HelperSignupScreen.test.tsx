import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelperSignupScreen } from '@/features/signup/HelperSignupScreen';
import { SIGNUP_GUIDES } from '@/features/signup/guides';

const apiRequest = vi.fn();
vi.mock('@/lib/api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/client')>()),
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

// 큰 글씨 토글은 이 테스트 대상이 아니고, 테스트 환경의 Node localStorage가 jsdom 것을 가린다
vi.mock('@/components/ui/A11yToggle', () => ({ A11yToggle: () => null }));

// 상단 바 뒤로 = 브라우저 뒤로. 2단계(#info)에서 뒤로 가면 해시가 빠진다
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    back: () => {
      window.location.hash = '';
    },
  }),
}));

async function readAllGuides(user: UserEvent) {
  for (const guide of SIGNUP_GUIDES) {
    await user.click(screen.getByRole('button', { name: new RegExp(`^${guide.name}`) }));
    await user.click(screen.getByRole('checkbox', { name: '읽었어요' }));
  }
}

describe('HelperSignupScreen', () => {
  beforeEach(() => {
    window.location.hash = '';
    apiRequest.mockReset();
  });

  it('안내 자료를 다 읽기 전이면 #info로 바로 들어와도 1단계를 보이고 다음을 막는다', () => {
    window.location.hash = '#info';

    render(<HelperSignupScreen />);

    expect(screen.getByRole('heading', { name: '가입 전에 꼭 읽어 주세요' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('2단계에서 1단계로 돌아갔다 다시 오면 입력값과 아띠 소속 선택이 남아 있다', async () => {
    // given: 안내 자료를 다 읽고 2단계에 값을 입력했다
    const user = userEvent.setup();
    render(<HelperSignupScreen />);
    await readAllGuides(user);
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.type(screen.getByRole('textbox', { name: '이름' }), '이도움');
    await user.type(screen.getByRole('textbox', { name: '카톡 ID' }), 'hankki_helper');
    await user.type(screen.getByLabelText('비밀번호'), 'hankki!2026');
    await user.click(screen.getByRole('checkbox', { name: '아띠 소속이에요 (선택)' }));

    // when: 상단 바 뒤로로 1단계에 갔다가 다시 다음을 누른다
    await user.click(screen.getByRole('button', { name: '뒤로' }));
    expect(
      await screen.findByRole('heading', { name: '가입 전에 꼭 읽어 주세요' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음' }));

    // then
    expect(screen.getByRole('textbox', { name: '이름' })).toHaveValue('이도움');
    expect(screen.getByRole('textbox', { name: '카톡 ID' })).toHaveValue('hankki_helper');
    expect(screen.getByLabelText('비밀번호')).toHaveValue('hankki!2026');
    expect(screen.getByRole('checkbox', { name: '아띠 소속이에요 (선택)' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('이름이 50자를 넘으면 가입 요청을 보내지 않고 이름 칸에 오류를 보이며 포커스한다', async () => {
    const user = userEvent.setup();
    render(<HelperSignupScreen />);
    await readAllGuides(user);
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.type(screen.getByRole('textbox', { name: '이름' }), '가'.repeat(51));

    await user.click(screen.getByRole('button', { name: '가입하기' }));

    const name = screen.getByRole('textbox', { name: '이름' });
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription(/50자/);
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
