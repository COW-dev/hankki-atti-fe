'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode, Ref } from 'react';
import { A11yToggle } from '@/components/ui/A11yToggle';
import { Icon } from '@hankki/icons';
import { Logo } from '@/components/ui/Logo';

export type TopBarViewProps = {
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
  notificationButtonRef?: Ref<HTMLButtonElement>;
  // 벨이 여는 패널의 id (aria-controls)
  notificationPanelId?: string;
  // 상단 바 줄 아래에 붙는 것 (알림 패널·알림 안내 영역). 줄 다음에 두어 보이는 순서 = 읽는 순서
  children?: ReactNode;
};

/** 상단 바 모양. 알림 데이터 연결은 TopBar가 고른다. */
export function TopBarView({
  title,
  back = false,
  logo = false,
  bell = false,
  unreadCount = 0,
  notificationExpanded,
  onNotificationClick,
  notificationButtonRef,
  notificationPanelId,
  children,
}: TopBarViewProps) {
  const router = useRouter();

  return (
    <header className="relative w-full">
      <div className="flex min-h-[60px] w-full items-center gap-(--space-xs) bg-(--color-bg-default) px-(--space-md) py-(--space-xs)">
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
            ref={notificationButtonRef}
            type="button"
            aria-label={unreadCount > 0 ? `알림, 안 읽은 알림 ${unreadCount}개` : '알림'}
            aria-expanded={notificationExpanded}
            aria-controls={notificationExpanded ? notificationPanelId : undefined}
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
      </div>
      {children}
    </header>
  );
}
