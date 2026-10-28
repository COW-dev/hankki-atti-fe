import type { Metadata } from 'next';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';
import { AccessibilitySync } from '@/lib/accessibility/AccessibilitySync';
import { AuthProvider } from '@/lib/auth/AuthProvider';

export const metadata: Metadata = {
  title: '한끼아띠',
  description: '명지대학교 장애학생 식사 도우미 매칭 서비스',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {/* 접근성 모드를 로그인 후 계정 설정으로 맞추고, 바꾸면 계정에도 저장한다 (U-06) */}
          <AccessibilitySync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
