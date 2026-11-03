import Link from 'next/link';

const TABS = [
  { href: '/students', label: '학생 목록' },
  { href: '/students/requests', label: '전체 신청 현황' },
] as const;

// Figma 14:1294 · 14:1567 탭. 누르는 영역은 크기 모드 높이를 지킨다
const TAB_CLASS = 'typo-label -mb-px flex min-h-(--control-height) items-end px-0.5 pb-2.5';
const TAB_CURRENT = 'border-b-2 border-(--color-bg-brand-strong) text-(--color-text-brand)';
const TAB_OTHER = 'text-(--color-text-secondary)';

export function StudentTabs({ active }: { active: (typeof TABS)[number]['href'] }) {
  return (
    <nav
      aria-label="장애학생 관리 보기"
      className="flex gap-6 border-b border-(--color-border-default)"
    >
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === active ? 'page' : undefined}
          className={`${TAB_CLASS} ${tab.href === active ? TAB_CURRENT : TAB_OTHER}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
