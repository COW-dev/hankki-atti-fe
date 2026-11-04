import Link from 'next/link';

/**
 * 관리자 화면 탭 (real_page 14:1294 · 14:1567 · 14:1880). 탭마다 주소가 달라 tablist가 아니라 nav 링크로 둔다.
 * 누르는 영역은 크기 모드 높이를 지킨다.
 */
export function TabNav({
  label,
  items,
  current,
}: {
  label: string;
  items: readonly { href: string; label: string }[];
  current: string;
}) {
  return (
    <nav aria-label={label} className="flex gap-6 border-b border-(--color-border-default)">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === current ? 'page' : undefined}
          className={`typo-label -mb-px flex min-h-(--control-height) items-end px-0.5 pb-2.5 ${
            item.href === current
              ? 'border-b-2 border-(--color-bg-brand-strong) text-(--color-text-brand)'
              : 'text-(--color-text-secondary)'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
