'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from '@hankki/icons';
import { SidebarItem, StatusTag } from '@hankki/ui';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useSessionGuard, type AdminMe } from '@/lib/auth/useSessionGuard';
import { ADMIN_GRADE_TAG } from '@/lib/labels/admin';

export type AdminMenu = '/students' | '/helpers' | '/notices';

// 항목마다 아이콘이 다르다 (Figma 14:1279 장애학생 · 14:2155 도우미 · 14:2484 공지사항)
const MENUS: { href: AdminMenu; label: string; icon: string }[] = [
  { href: '/students', label: '장애학생', icon: 'sidebar-student' },
  { href: '/helpers', label: '도우미', icon: 'sidebar-helper' },
  { href: '/notices', label: '공지사항', icon: 'sidebar-notice' },
];

/**
 * 관리자 화면 틀 (A-01, Figma 14:1275 전체 권한 · 14:1436 제한 권한): 스킵 링크 → 사이드바(nav) → 본문.
 * 관리자만 들어오게 막고, 확인이 끝나기 전에는 아무것도 그리지 않는다. 접근성 토글·알림은 두지 않는다 (A-01 명세)
 * 화면 제목(h1)을 여기서 그려, 화면이 보이면 제목으로 포커스를 옮긴다 (A11Y 공통 규칙: 화면 이동 후 포커스는 h1)
 */
export function AdminShell({
  active,
  title,
  back,
  action,
  children,
}: {
  active: AdminMenu;
  title: string;
  // 제목 위 돌아가기 링크 (Figma 14:1739 "‹ 학생 목록")
  back?: { href: string; label: string };
  action?: (me: AdminMe) => ReactNode;
  // 권한별로 그리는 화면은 함수로 받아 확인된 내 정보(권한 등급)를 쓴다 — /api/admin/me를 다시 부르지 않는다
  children?: ReactNode | ((me: AdminMe) => ReactNode);
}) {
  const me = useSessionGuard('ADMIN');
  const { logout } = useAuth();
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 관리자 확인이 끝나야 제목이 그려진다. 같은 틀에서 제목만 바뀌어도 다시 옮긴다
  useEffect(() => {
    if (me) titleRef.current?.focus();
  }, [me, title]);

  if (!me) return null;
  const grade = ADMIN_GRADE_TAG[me.grade];

  return (
    <div data-size="admin" className="flex min-h-screen w-full bg-(--color-bg-subtle)">
      <a
        href="#admin-main"
        className="typo-body-strong sr-only focus:not-sr-only focus:fixed focus:top-(--space-xs) focus:left-(--space-xs) focus:z-10 focus:inline-flex focus:min-h-(--control-height) focus:items-center focus:rounded-(--radius-control) focus:bg-(--color-bg-default) focus:px-(--space-sm) focus:text-(--color-text-primary)"
      >
        본문으로 건너뛰기
      </a>
      <nav
        aria-label="관리자 메뉴"
        className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-1 border-r border-(--color-border-default) bg-(--color-bg-default) px-4 pt-7 pb-6"
      >
        <div className="flex flex-col gap-1.5 px-2 pb-5">
          <Logo variant="sidebar" />
          <p className="typo-caption-strong text-(--color-text-secondary)">관리자</p>
        </div>
        {MENUS.map((menu) => (
          <SidebarItem
            key={menu.href}
            href={menu.href}
            active={menu.href === active}
            icon={menu.href === active ? `${menu.icon}-active` : menu.icon}
          >
            {menu.label}
          </SidebarItem>
        ))}
        <div className="flex-1" />
        <div className="flex flex-col items-start gap-2 rounded-(--radius-md) bg-(--color-bg-muted) p-3.5">
          <div className="flex items-center gap-2">
            <p className="typo-body-strong text-(--color-text-primary)">{me.name}</p>
            <StatusTag tone={grade.tone}>{grade.label}</StatusTag>
          </div>
          {/* 목업은 밑줄 글자지만 동작이라 button. 조작 영역은 크기 모드 높이를 지킨다 */}
          <button
            type="button"
            onClick={() => void logout()}
            className="typo-caption-strong min-h-(--control-height) text-(--color-text-secondary) underline"
          >
            로그아웃
          </button>
        </div>
      </nav>
      <main id="admin-main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col px-10 pt-8 pb-10">
        {/* 목업은 글자 높이뿐이지만 조작 영역은 크기 모드 높이를 지킨다 */}
        {back && (
          <Link
            href={back.href}
            className="typo-caption-strong -mt-3 flex min-h-(--control-height) items-center gap-1 self-start text-(--color-text-brand)"
          >
            <Icon name="breadcrumb-back" size={6.125} />
            {back.label}
          </Link>
        )}
        {/* 제목 줄 오른쪽 끝에 화면의 주 동작을 둔다 (Figma 14:1290 "+ 학생 등록") */}
        <div className="flex items-center gap-2">
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="typo-display flex-1 text-(--color-text-primary)"
          >
            {title}
          </h1>
          {action?.(me)}
        </div>
        {typeof children === 'function' ? children(me) : children}
      </main>
    </div>
  );
}
