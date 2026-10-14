import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorNotice, Notice } from '@hankki/ui';

describe('Notice', () => {
  it('오류 톤은 alert로 바로 읽힌다', () => {
    render(<Notice tone="error">아이디를 확인해 주세요</Notice>);

    expect(screen.getByRole('alert')).toHaveTextContent('아이디를 확인해 주세요');
  });

  it('live면 status로 조용히 읽히고, 아니면 role이 없다', () => {
    const { rerender } = render(
      <Notice tone="success" live>
        신청 완료
      </Notice>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('신청 완료');

    rerender(<Notice tone="info">10월 7일 12:00 ~ 13:00</Notice>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('10월 7일 12:00 ~ 13:00')).toBeInTheDocument();
  });

  it('ErrorNotice는 오류 Notice와 같다', () => {
    render(<ErrorNotice message="잠시 후 다시 시도해 주세요" />);

    expect(screen.getByRole('alert')).toHaveTextContent('잠시 후 다시 시도해 주세요');
  });
});
