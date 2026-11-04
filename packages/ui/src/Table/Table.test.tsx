import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { None, Table, TableEmpty, TableRow, TableRowLink } from './Table';

describe('Table', () => {
  it('caption을 표 이름으로, 머리 칸을 열 머리로 읽는다', () => {
    render(
      <Table
        caption="장애학생 목록"
        columns={
          <>
            <th scope="col">이름</th>
            <th scope="col">최근 신청</th>
          </>
        }
      >
        <TableRow linked>
          <th scope="row">
            <TableRowLink href="/students/1" aria-label="김민지 상세">
              김민지
            </TableRowLink>
          </th>
          <td>
            <None label="신청 없음" />
          </td>
        </TableRow>
      </Table>,
    );

    expect(screen.getByRole('table', { name: '장애학생 목록' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      '이름',
      '최근 신청',
    ]);
    expect(screen.getByRole('link', { name: '김민지 상세' })).toHaveAttribute(
      'href',
      '/students/1',
    );
    expect(screen.getByRole('cell')).toHaveTextContent('신청 없음');
  });

  it('빈 결과 행은 모든 열을 덮는다', () => {
    render(
      <Table caption="매칭현황" columns={<th scope="col">식사 일시</th>}>
        <TableEmpty colSpan={6}>신청이 없어요</TableEmpty>
      </Table>,
    );

    expect(screen.getByRole('cell', { name: '신청이 없어요' })).toHaveAttribute('colspan', '6');
  });
});

describe('None', () => {
  it('줄표는 숨기고 기본으로 "없음"을 읽는다', () => {
    render(<None />);

    expect(screen.getByText('–')).toHaveAttribute('aria-hidden');
    expect(screen.getByText('없음')).toBeInTheDocument();
  });
});
