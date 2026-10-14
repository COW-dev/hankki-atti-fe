'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { A11yToggle } from '@/components/ui/A11yToggle';
import { Icon } from '@hankki/icons';
import { Logo } from '@/components/ui/Logo';

type TopBarProps = {
  // 화면마다 하나인 h1 (A11Y 공통 규칙)
  title: string;
  // 하위 화면은 뒤로 + 제목, 탭 화면은 로고 + 제목 (Figma TopBar 1:1227, 로고 변형은 이전 목업 201:3)
  back?: boolean;
  logo?: boolean;
  // 로그인 전에는 알림을 숨긴다
  bell?: boolean;
  unreadCount?: number;
  notificationExpanded?: boolean;
  onNotificationClick?: () => void;
};

export function TopBar({
  title,
  back = false,
  logo = false,
  bell = false,
  unreadCount = 0,
  notificationExpanded,
  onNotificationClick,
}: TopBarProps) {
  const router = useRouter();

  return (
    <header className="flex min-h-[60px] w-full items-center gap-(--space-xs) bg-(--color-bg-default) px-(--space-md) py-(--space-xs)">
      {back && (
        <button
          type="button"
          aria-label="뒤로"
          onClick={() => router.back()}
          className="flex min-h-(--control-height) min-w-(--control-height) shrink-0 items-center justify-center"
        >
          <Icon name="back" />
        </button>
      )}
      {logo && (
        <Link
          href="/"
          aria-label="홈"
          className="mr-0.5 flex min-h-(--control-height) min-w-(--control-height) shrink-0 items-center justify-center"
        >
          <Logo variant="topbar" />
        </Link>
      )}
      <h1 className="typo-title min-w-px flex-1 text-(--color-text-primary)">{title}</h1>
      {bell && (
        <button
          type="button"
          aria-label={unreadCount > 0 ? `알림, 안 읽은 알림 ${unreadCount}개` : '알림'}
          aria-expanded={notificationExpanded}
          onClick={onNotificationClick}
          className="relative flex min-h-(--control-height) min-w-(--control-height) shrink-0 items-center justify-center"
        >
          <Icon
            name={unreadCount > 0 ? 'notification' : 'bell'}
            size={unreadCount > 0 ? 'var(--control-height)' : undefined}
          />
        </button>
      )}
      <A11yToggle />
    </header>
  );
}
