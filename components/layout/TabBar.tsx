import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

// 장애학생 탭 (Figma TabBar 70:141, Role=장애학생). 아직 화면이 없는 탭은 링크만 둔다
const STUDENT_TABS = [
  { href: '/requests/new', label: '도우미 신청', icon: 'tab-apply' },
  { href: '/requests', label: '내 신청', icon: 'tab-my-requests-active' },
  { href: '/notices', label: '공지사항', icon: 'tab-notice' },
  { href: '/mypage', label: '마이페이지', icon: 'tab-mypage' },
] as const;

export function StudentTabBar({ active }: { active: (typeof STUDENT_TABS)[number]['href'] }) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="sticky bottom-0 flex h-(--tabbar-height) w-full border-t border-(--color-border-default) bg-(--color-bg-default)"
    >
      {STUDENT_TABS.map((tab) => {
        const current = tab.href === active;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? 'page' : undefined}
            className="flex h-full min-w-px flex-1 flex-col items-center justify-center gap-(--space-2xs)"
          >
            <Icon name={tab.icon} />
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
