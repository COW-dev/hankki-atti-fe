import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TabNav } from './TabNav';

const ITEMS = [
  { href: '/students', label: '학생 목록' },
  { href: '/students/requests', label: '전체 신청 현황' },
];

describe('TabNav', () => {
  it('현재 탭만 현재 페이지로 알리고 묶음 이름을 붙인다', () => {
    render(<TabNav label="장애학생 관리 보기" items={ITEMS} current="/students/requests" />);

    expect(screen.getByRole('navigation', { name: '장애학생 관리 보기' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '전체 신청 현황' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: '학생 목록' })).not.toHaveAttribute('aria-current');
  });
});
