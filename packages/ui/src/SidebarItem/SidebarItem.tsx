import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Icon } from '@hankki/icons';

/** Figma SidebarItem (1:1352). 화면 이동은 링크로, 현재 항목은 aria-current로 알린다. */
export function SidebarItem({
  active = false,
  children,
  className,
  icon,
  ...props
}: ComponentProps<typeof Link> & { active?: boolean; icon?: string }) {
  return (
    <Link
      {...props}
      aria-current={active ? 'page' : undefined}
      className={`typo-body-strong flex min-h-[max(var(--control-height),var(--sidebar-item-height))] w-full items-center gap-(--space-xs) rounded-(--radius-control) px-(--space-sm) py-(--space-md) ${active ? 'bg-(--color-bg-brand-selected) text-(--color-text-brand)' : 'text-(--color-text-secondary)'} ${className ?? ''}`}
    >
      <Icon name={icon ?? (active ? 'sidebar-users-active' : 'sidebar-users')} />
      <span className="min-w-0 flex-1">{children}</span>
    </Link>
  );
}
