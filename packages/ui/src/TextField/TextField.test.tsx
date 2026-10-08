import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('helper를 주면 설명으로 읽히고, 오류가 생기면 오류 문구가 대신한다', () => {
    const { rerender } = render(<TextField label="학번" helper="로그인 아이디로 써요" />);
    expect(screen.getByRole('textbox', { name: '학번' })).toHaveAccessibleDescription(
      '로그인 아이디로 써요',
    );

    rerender(<TextField label="학번" helper="로그인 아이디로 써요" error="학번을 입력해 주세요" />);
    expect(screen.getByRole('textbox', { name: '학번' })).toHaveAccessibleDescription(
      '학번을 입력해 주세요',
    );
  });

  it('multiline이면 여러 줄 입력칸이 되고 글자 수가 설명에 들어간다', async () => {
    render(<TextField multiline label="메모 (선택)" count={200} />);
    const textarea = screen.getByRole('textbox', { name: '메모 (선택)' });

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAccessibleDescription('0 / 200자');

    await userEvent.type(textarea, '출입구에서 기다릴게요');
    expect(textarea).toHaveAccessibleDescription('11 / 200자');
    expect(textarea).not.toHaveAttribute('aria-invalid');
  });

  it('최대 글자 수를 넘으면 오류로 표시하되 입력은 막지 않는다', async () => {
    render(<TextField multiline label="메모" count={5} />);
    const textarea = screen.getByRole('textbox', { name: '메모' });

    await userEvent.type(textarea, '여섯글자예요');

    expect(textarea).toHaveValue('여섯글자예요');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription('5자까지 쓸 수 있어요 6 / 5자');
  });
});
