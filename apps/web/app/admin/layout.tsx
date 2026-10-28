import type { Metadata } from 'next';

// 관리자 화면은 검색에 노출하지 않는다
export const metadata: Metadata = {
  title: '한끼아띠 관리자',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return children;
}
