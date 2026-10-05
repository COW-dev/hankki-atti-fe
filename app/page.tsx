import { Footer } from "@/components/layout/Footer";
import { Block, PageShell } from "@/components/layout/PageShell";
import { TopBar } from "@/components/layout/TopBar";
import { Logo } from "@/components/ui/Logo";

// 첫 화면 자리. 소개 화면(M-01, Figma 203:104)과 로그인 이동은 인증 화면 작업에서 붙인다
export default function Home() {
  return (
    <PageShell size="L" topBar={<TopBar title="한끼아띠" />} footer={<Footer copyright />}>
      <Block gap="md">
        <div className="flex w-full flex-col items-center gap-(--space-md) py-(--space-xl)">
          <Logo variant="large" />
          <p className="typo-body text-center text-(--color-text-secondary)">
            명지대학교 장애학생 식사 도우미 매칭 서비스
          </p>
        </div>
      </Block>
    </PageShell>
  );
}
