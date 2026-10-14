import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorNotice, Notice } from './Notice';

describe('ErrorNotice', () => {
  it('오류를 즉시 알리고 장식 아이콘은 읽지 않는다', () => {
    render(<ErrorNotice message="아이디 또는 비밀번호를 확인해 주세요" />);
    expect(screen.getByRole('alert')).toHaveTextContent('아이디 또는 비밀번호를 확인해 주세요');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it.each(['info', 'success', 'warning'] as const)('%s 안내는 정중하게 알린다', (type) => {
    render(<Notice type={type} message="신청을 확인해 주세요" />);
    expect(screen.getByRole('status')).toHaveTextContent('신청을 확인해 주세요');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
