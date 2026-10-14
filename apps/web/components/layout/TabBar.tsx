import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Icon } from '@hankki/icons';

// 장애학생 탭 (Figma TabBar 1:1235, Role=장애학생). 아직 화면이 없는 탭은 링크만 둔다
const STUDENT_TABS = [
  {
    href: '/requests/new',
    label: '도우미 신청',
    icon: 'tab-apply',
    activeIcon: 'tab-apply-active',
  },
  {
    href: '/requests',
    label: '내 신청',
    icon: 'tab-my-requests',
    activeIcon: 'tab-my-requests-active',
  },
  { href: '/notices', label: '공지사항', icon: 'tab-notice', activeIcon: 'tab-notice-active' },
  { href: '/mypage', label: '마이페이지', icon: 'tab-mypage', activeIcon: 'tab-mypage-active' },
] as const;

const HELPER_TABS = [
  {
    href: '/requests',
    label: '요청 목록',
    icon: 'tab-my-requests',
    activeIcon: 'tab-my-requests-active',
  },
  { href: '/matches', label: '매칭 현황', icon: 'tab-matches', activeIcon: 'tab-matches-active' },
  { href: '/notices', label: '공지사항', icon: 'tab-notice', activeIcon: 'tab-notice-active' },
  { href: '/mypage', label: '마이페이지', icon: 'tab-mypage', activeIcon: 'tab-mypage-active' },
];

type Tab = {
  href: ComponentProps<typeof Link>['href'];
  label: string;
  icon: string;
  activeIcon: string;
};

/** Figma TabBar (1:1235): 장애학생·도우미의 현재 메뉴를 같은 읽기 순서로 표시한다. */
function TabBar({ active, tabs }: { active: string; tabs: readonly Tab[] }) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="sticky bottom-0 flex h-(--tabbar-height) w-full border-t border-(--color-border-default) bg-(--color-bg-default)"
    >
      {tabs.map((tab) => {
        const current = tab.href === active;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={current ? 'page' : undefined}
            className="flex h-full min-h-(--control-height) min-w-px flex-1 flex-col items-center justify-center gap-(--space-2xs)"
          >
            <Icon name={current ? tab.activeIcon : tab.icon} />
            <span
              className={`whitespace-nowrap ${current ? 'typo-caption-strong text-(--color-text-brand)' : 'typo-caption text-(--color-text-secondary)'}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function StudentTabBar({ active }: { active: (typeof STUDENT_TABS)[number]['href'] }) {
  return <TabBar active={active} tabs={STUDENT_TABS} />;
}

export function HelperTabBar({ active }: { active: string }) {
  return <TabBar active={active} tabs={HELPER_TABS} />;
}
