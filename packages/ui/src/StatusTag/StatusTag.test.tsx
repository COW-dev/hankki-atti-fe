import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusTag } from '@hankki/ui';

describe('StatusTag', () => {
  it('상태 글자를 보여 주고, 장식 아이콘은 이름에 들어가지 않는다', () => {
    render(<StatusTag tone="success">매칭 완료</StatusTag>);

    expect(screen.getByText('매칭 완료')).toHaveTextContent(/^매칭 완료$/);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('정보·중립 톤은 아이콘 없이 글자만 있다', () => {
    const { container } = render(<StatusTag tone="neutral">도우미 바뀜</StatusTag>);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('도우미 바뀜')).toBeInTheDocument();
  });
});
