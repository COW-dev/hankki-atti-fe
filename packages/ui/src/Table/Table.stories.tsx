import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { None, Table, TableEmpty, TableRow, TableRowLink } from './Table';
const meta = {
  title: '공용 UI/Table',
  component: Table,
  args: {
    caption: '장애학생 목록',
    columns: (
      <>
        <th scope="col" className="w-40 pl-5">
          이름
        </th>
        <th scope="col">최근 신청</th>
      </>
    ),
    children: (
      <>
        <TableRow linked>
          <th scope="row" className="typo-body-strong pl-5">
            <TableRowLink href="/students/1" aria-label="김민지 상세">
              김민지
            </TableRowLink>
          </th>
          <td>10.28 12:00</td>
        </TableRow>
        <TableRow linked>
          <th scope="row" className="typo-body-strong pl-5">
            <TableRowLink href="/students/2" aria-label="이서준 상세">
              이서준
            </TableRowLink>
          </th>
          <td>
            <None label="신청 없음" />
          </td>
        </TableRow>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div data-size="admin" className="bg-(--color-bg-subtle) p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: '장애학생 목록' })).toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { children: <TableEmpty colSpan={2}>조건에 맞는 학생이 없어요</TableEmpty> },
};
