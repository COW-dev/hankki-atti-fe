"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Block } from "@hankki/ui";
import { PageShell } from "@/components/layout/PageShell";
import { A11yToggle } from "@/components/ui/A11yToggle";
import { ButtonLink } from "@hankki/ui";
import { Logo } from "@/components/ui/Logo";
import { ApiError } from "@/lib/api/client";
import { ErrorCode } from "@/lib/api/error-codes";
import { homePathOf, useAuth, type Me } from "@/lib/auth/AuthProvider";

const STEPS = ["도우미를 신청해요", "지원하면 바로 알려드려요", "학식당에서 만나요"];

// M-01 소개 (Figma 203:104). 로그인한 사람은 소개 없이 역할별 첫 화면으로 보낸다
// Figma의 부제("신청하면 도우미 학생이 지원해요")와 계정 안내("장애학생 계정은 센터에서 만들어 드려요")는 명세에 없어 넣지 않는다
export default function Home() {
  const router = useRouter();
  const { status, authRequest } = useAuth();

  useEffect(() => {
    if (status !== "authenticated") return;
    authRequest<Me>("/api/me")
      .then((me) => router.replace(homePathOf(me.role)))
      .catch((error) => {
        const mustChange = error instanceof ApiError && error.code === ErrorCode.PASSWORD_CHANGE_REQUIRED;
        router.replace(mustChange ? "/password/change" : "/login");
      });
  }, [status, authRequest, router]);

  // 로그인 여부를 확인하는 동안은 그리지 않는다 — 로그인한 사람에게 소개 화면이 잠깐 보이지 않게
  if (status !== "anonymous") return null;

  return (
    <PageShell size="L" topBar={<IntroHeader />} footer={<Footer copyright />}>
      <div className="flex flex-col gap-2.5">
        <Block>
          <ol aria-label="이렇게 이용해요" className="flex w-full flex-col gap-3.5">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                {/* 번호 원은 글자 크기의 2배 (Figma 28px · 캡션 14px) — 큰 글씨에서도 숫자가 원 안에 들어간다 */}
                <span className="typo-caption-strong flex size-[calc(var(--font-caption)*2)] shrink-0 items-center justify-center rounded-(--radius-full) bg-(--color-bg-muted) text-(--color-text-brand)">
                  {index + 1}
                </span>
                <span className="typo-body text-(--color-text-primary)">{step}</span>
              </li>
            ))}
          </ol>
        </Block>
        <Block>
          <ButtonLink href="/login" className="w-full">
            로그인
          </ButtonLink>
          <ButtonLink href="/signup" variant="secondary" className="w-full">
            도우미로 회원가입
          </ButtonLink>
        </Block>
      </div>
    </PageShell>
  );
}

// 소개 화면은 상단 바 대신 접근성 토글과 히어로(로고·제목)를 한 흰 면에 둔다 (Figma Top 203:105 · Hero 203:110)
function IntroHeader() {
  return (
    <header className="flex w-full flex-col bg-(--color-bg-default)">
      <div className="flex justify-end px-4 pt-1">
        <A11yToggle />
      </div>
      <div className="flex flex-col items-center gap-3 px-5 pt-2 pb-7">
        <Logo variant="hero" />
        <div className="h-1" />
        <h1 className="typo-display w-full text-center text-(--color-text-primary)">
          학식당 식사,
          <br />
          도우미와 함께해요
        </h1>
      </div>
    </header>
  );
}
