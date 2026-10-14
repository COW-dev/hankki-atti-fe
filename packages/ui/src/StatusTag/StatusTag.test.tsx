import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusTag } from './StatusTag';

describe('StatusTag', () => {
  it('모든 상태는 색과 함께 상태 문구를 표시한다', () => {
    render(
      <>
        {[
          <StatusTag key="success" type="success">
            매칭 완료
          </StatusTag>,
          <StatusTag key="progress" type="progress">
            모집 중
          </StatusTag>,
          <StatusTag key="ended" type="ended">
            이용 완료
          </StatusTag>,
          <StatusTag key="error" type="error">
            발송 실패
          </StatusTag>,
          <StatusTag key="warning" type="warning">
            매칭 실패
          </StatusTag>,
          <StatusTag key="info" type="info">
            고정
          </StatusTag>,
          <StatusTag key="neutral" type="neutral">
            소속
          </StatusTag>,
        ]}
      </>,
    );
    for (const label of [
      '매칭 완료',
      '모집 중',
      '이용 완료',
      '발송 실패',
      '매칭 실패',
      '고정',
      '소속',
    ])
      expect(screen.getByText(label)).toBeVisible();
  });
  it('장식 아이콘은 읽기에서 숨기고 상태를 중복 알리지 않는다', () => {
    render(
      <StatusTag type="success" icon={<span role="img" aria-label="체크" />}>
        매칭 완료
      </StatusTag>,
    );
    expect(screen.getByText('매칭 완료')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
