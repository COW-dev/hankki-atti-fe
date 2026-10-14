import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidebarItem } from './SidebarItem';
describe('SidebarItem', () => {
  it('현재 메뉴만 현재 페이지로 알리고 목적지 주소를 유지한다', () => {
    render(
      <>
        <SidebarItem href="/students" active>
          장애학생
        </SidebarItem>
        <SidebarItem href="/helpers">도우미</SidebarItem>
      </>,
    );
    expect(screen.getByRole('link', { name: '장애학생' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '장애학생' })).toHaveAttribute('href', '/students');
    expect(screen.getByRole('link', { name: '도우미' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
