import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, ButtonLink } from '@/components/ui/Button';

describe('Button', () => {
  it('inactive면 포커스는 받지만 누를 수 없다', async () => {
    // given
    const onClick = vi.fn();
    render(
      <Button inactive onClick={onClick}>
        비밀번호 바꾸기
      </Button>,
    );
    const button = screen.getByRole('button', { name: '비밀번호 바꾸기' });

    // when
    await userEvent.tab();
    await userEvent.click(button);

    // then
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('inactive인 submit 버튼은 폼을 제출하지 않는다', async () => {
    // given
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button type="submit" inactive>
          로그인
        </Button>
      </form>,
    );

    // when
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    // then
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('type을 주지 않으면 폼 안에서도 submit이 아닌 button으로 동작한다', () => {
    render(<Button>도우미 신청하기</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('ButtonLink는 버튼 모양이어도 링크로 읽히고 주소를 가진다', () => {
    render(<ButtonLink href="/login">로그인</ButtonLink>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login');
  });
});
