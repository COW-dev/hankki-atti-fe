"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { A11yToggle } from "@/components/ui/A11yToggle";
import { Icon } from "@hankki/icons";
import { Logo } from "@/components/ui/Logo";

type TopBarProps = {
  // 화면마다 하나인 h1 (A11Y 공통 규칙)
  title: string;
  // 하위 화면은 뒤로 + 제목, 탭 화면은 로고 + 제목 (Figma Mockup / TopBar 201:3)
  back?: boolean;
  logo?: boolean;
  // 로그인 전에는 알림을 숨긴다
  bell?: boolean;
};

export function TopBar({ title, back = false, logo = false, bell = false }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="flex min-h-[60px] w-full items-center gap-(--space-xs) border-b border-(--color-border-default) bg-(--color-bg-default) px-(--space-sm) py-(--space-2xs)">
      {back && (
        <button
          type="button"
          aria-label="뒤로"
          onClick={() => router.back()}
          className="flex h-11 w-10 shrink-0 items-center justify-center"
        >
          <Icon name="back" />
        </button>
      )}
      {logo && (
        <Link href="/" aria-label="홈" className="mr-0.5 shrink-0">
          <Logo variant="topbar" />
        </Link>
      )}
      <h1 className="typo-title min-w-px flex-1 text-(--color-text-primary)">{title}</h1>
      {bell && (
        // 안 읽은 개수는 알림 기능(F-08)에서 이름에 붙인다: "알림, 안 읽은 알림 2개"
        <button type="button" aria-label="알림" className="relative size-11 shrink-0">
          <Icon name="notification" size={44} />
        </button>
      )}
      <A11yToggle />
    </header>
  );
}
