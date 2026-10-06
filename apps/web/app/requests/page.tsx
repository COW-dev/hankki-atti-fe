"use client";

import { useRouter } from "next/navigation";
import { Button } from "@hankki/ui";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@hankki/icons";
import { Block } from "@hankki/ui";
import { PageShell } from "@/components/layout/PageShell";
import { StudentTabBar } from "@/components/layout/TabBar";
import { TopBar } from "@/components/layout/TopBar";
import { useSessionGuard } from "@/lib/auth/useSessionGuard";

// F-02 내 신청 · 빈 상태 (Figma 206:1281). 신청 목록 API(BE-22)가 생기면 목록을 붙인다
export default function MyRequestsPage() {
  const router = useRouter();
  const me = useSessionGuard("STUDENT");
  if (!me) return null;

  return (
    <PageShell
      size="L"
      topBar={<TopBar title="내 신청" logo bell />}
      footer={<Footer />}
      tabBar={<StudentTabBar active="/requests" />}
    >
      <Block>
        <div className="flex w-full flex-col items-center gap-2.5 pt-6 pb-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-(--color-bg-muted)">
            <Icon name="list" />
          </div>
          <div className="h-0.5" />
          <h2 className="typo-title w-full text-center">아직 신청한 건이 없어요</h2>
          <p className="typo-body w-full text-center text-(--color-text-secondary)">
            날짜와 시간을 고르면 도우미가 지원해요
          </p>
        </div>
        <Button onClick={() => router.push("/requests/new")} className="w-full">
          + 도우미 신청하기
        </Button>
      </Block>
    </PageShell>
  );
}
