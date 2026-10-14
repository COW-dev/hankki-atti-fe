import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RequestCard } from './RequestCard';
describe('RequestCard', () => {
  it('날짜로 카드와 동작 이름을 구분하고 선택한 동작을 실행한다', async () => {
    const onClick = vi.fn();
    render(
      <RequestCard
        title="10월 7일 12:00"
        meta="배식 보조"
        status="success"
        statusLabel="매칭 완료"
        action={{ label: '취소하기', onClick }}
      />,
    );
    expect(screen.getByRole('article', { name: '10월 7일 12:00' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '10월 7일 12:00' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '10월 7일 12:00 신청 취소하기' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('상대 정보와 동작이 없으면 서버가 준 표시 정보만 그린다', () => {
    render(
      <RequestCard
        title="10월 7일 12:00"
        meta="배식 보조"
        status="progress"
        statusLabel="모집 중"
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('모집 중')).toBeVisible();
  });
});
