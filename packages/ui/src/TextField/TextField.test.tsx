import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextField } from '@hankki/ui';

describe('TextField', () => {
  it('label이 입력칸 이름이 된다', () => {
    render(<TextField label="아이디" />);

    expect(screen.getByRole('textbox', { name: '아이디' })).toBeInTheDocument();
  });

  it('오류가 있으면 aria-invalid와 함께 오류 문구·규칙 안내를 모두 설명으로 연결한다', () => {
    // given
    render(
      <>
        <TextField
          label="새 비밀번호"
          error="새 비밀번호와 같게 입력해 주세요"
          describedBy="password-rules"
        />
        <p id="password-rules">8자 이상</p>
      </>,
    );

    // when
    const input = screen.getByRole('textbox', { name: '새 비밀번호' });

    // then
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('새 비밀번호와 같게 입력해 주세요 8자 이상');
  });

  it('오류가 없으면 aria-invalid를 달지 않는다', () => {
    render(<TextField label="아이디" />);

    expect(screen.getByRole('textbox', { name: '아이디' })).not.toHaveAttribute('aria-invalid');
  });
  it('안내 문구와 외부 설명을 함께 읽고 오류가 생기면 안내 대신 오류를 읽는다', () => {
    const { rerender } = render(
      <TextField label="학번" helper="로그인 아이디로 써요" aria-describedby="extra" />,
    );
    const extra = document.createElement('p');
    extra.id = 'extra';
    extra.textContent = '8자리';
    document.body.append(extra);
    expect(screen.getByRole('textbox', { name: '학번' })).toHaveAccessibleDescription(
      '로그인 아이디로 써요 8자리',
    );
    rerender(<TextField label="학번" helper="로그인 아이디로 써요" error="학번을 입력해 주세요" />);
    expect(screen.getByRole('alert')).toHaveTextContent('학번을 입력해 주세요');
    expect(screen.getByRole('textbox', { name: '학번' })).toHaveAccessibleDescription(
      '학번을 입력해 주세요',
    );
    expect(screen.queryByText('로그인 아이디로 써요')).not.toBeInTheDocument();
    extra.remove();
  });

  it('비활성 입력칸에는 값을 입력할 수 없다', async () => {
    render(<TextField label="학번" disabled helper="로그인 아이디로 써요" />);
    const input = screen.getByRole('textbox', { name: '학번' });
    await userEvent.type(input, '60221234');
    expect(input).toBeDisabled();
    expect(input).toHaveValue('');
    expect(input).toHaveAccessibleDescription('로그인 아이디로 써요');
  });
});
