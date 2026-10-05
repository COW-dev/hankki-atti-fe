import { Logo } from "@/components/ui/Logo";

/**
 * Figma Mockup / Footer (201:68). 비로그인 화면은 copyright를 켠다.
 */
export function Footer({ copyright = false }: { copyright?: boolean }) {
  return (
    <footer className="flex w-full flex-col items-center gap-(--space-xs) border-t border-(--color-border-default) bg-(--color-bg-subtle) px-(--space-lg) pt-(--space-lg) pb-(--space-xl)">
      <Logo variant="footer" />
      <div className="flex w-full flex-col items-center gap-0.5 text-center">
        <p className="typo-caption-strong w-full text-(--color-text-primary)">명지대학교 장애학생지원센터</p>
        <p className="typo-caption w-full text-(--color-text-secondary)">02-300-1529 · min9344@mju.ac.kr</p>
        <div className="typo-caption flex w-full flex-wrap justify-center gap-x-(--space-sm) text-(--color-text-secondary)">
          {/* 문서가 준비되면 링크를 단다 (목업: "준비 중인 문서예요") */}
          <span className="underline">개인정보처리방침</span>
          <span className="underline">이용약관</span>
        </div>
        {copyright && <p className="typo-caption w-full text-(--color-text-secondary)">© 2026 한끼아띠</p>}
      </div>
    </footer>
  );
}
