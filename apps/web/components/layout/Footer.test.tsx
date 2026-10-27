import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('문서 버튼을 누르면 준비 중이라고 정중하게 알린다', async () => {
    render(<Footer />);

    await userEvent.click(screen.getByRole('button', { name: '이용약관' }));

    expect(screen.getByRole('status')).toHaveTextContent('준비 중인 문서예요');
  });
});
