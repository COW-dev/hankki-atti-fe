/* eslint-disable @next/next/no-img-element -- Figma에서 내보낸 SVG를 그대로 그린다 (이미지 최적화 대상이 아님) */

type LogoVariant = "hero" | "large" | "topbar" | "footer";

// 쓰는 곳별 가로 크기 (Figma 목업 인스턴스). 세로는 원본 비율(722:500)을 따른다
const WIDTH: Record<LogoVariant, number> = {
  hero: 210,
  large: 150,
  topbar: 52,
  footer: 44,
};

/**
 * Figma "Mockup / Logo"(187:51)를 한 장의 SVG로 내보낸 것. 그릇 질감·점자 점 마스크·안쪽 그림자가 모두 들어 있다.
 * 레이어를 따로 받아 겹치면 마스크 좌표가 어긋나므로 쪼개지 않는다.
 */
export function Logo({ variant, className }: { variant: LogoVariant; className?: string }) {
  const width = WIDTH[variant];
  return (
    <img
      src="/images/logo/logo.svg"
      alt="한끼아띠"
      width={width}
      height={Math.round((width * 500) / 722)}
      className={`block shrink-0 ${className ?? ""}`}
    />
  );
}
