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
});
