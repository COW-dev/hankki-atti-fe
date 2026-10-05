/* eslint-disable @next/next/no-img-element -- Figma 로고 레이어(마스크·블렌드)를 그대로 겹쳐야 해서 next/image 대신 img를 쓴다 */
import type { CSSProperties } from "react";

type LogoVariant = "large" | "topbar" | "footer";

// Figma "Mockup / Logo" 인스턴스의 크기별 치수 (187:51). 로고는 그릇 + 점자 점 + 글자 세 레이어를 겹친다
const VARIANTS: Record<
  LogoVariant,
  {
    width: number;
    height: number;
    frame: { width: number; height: number; top: number };
    bowl: { width: number; height: number };
    dotsInset: string;
  }
> = {
  large: {
    width: 150,
    height: 103.878,
    frame: { width: 150.073, height: 103.85, top: 0.01 },
    bowl: { width: 141.347, height: 89.262 },
    dotsInset: "-2.5% -0.64%",
  },
  topbar: {
    width: 52,
    height: 36.011,
    frame: { width: 52.025, height: 36.001, top: 0 },
    bowl: { width: 49, height: 30.944 },
    dotsInset: "-2.51% -0.64%",
  },
  footer: {
    width: 44,
    height: 30.471,
    frame: { width: 44.021, height: 30.463, top: -0.01 },
    bowl: { width: 41.462, height: 26.183 },
    dotsInset: "-2.5% -0.64% -2.51% -0.64%",
  },
};

export function Logo({ variant, className }: { variant: LogoVariant; className?: string }) {
  const v = VARIANTS[variant];
  const base = `/images/logo/${variant}`;
  const dotsMask: CSSProperties = {
    inset: "26.14% 1.43% 39.6% 6.39%",
    maskImage: `url("${base}/dots-mask-a.svg"), url("${base}/dots-mask-b.svg")`,
    maskPosition: "-10.458px -60.238px, -12.994px -62.774px",
    maskSize: "686.152px 390.532px, 691.225px 395.604px",
    mixBlendMode: "hard-light",
  };

  return (
    <div
      role="img"
      aria-label="한끼아띠"
      className={`relative shrink-0 ${className ?? ""}`}
      style={{ width: v.width, height: v.height }}
    >
      <div
        className="absolute left-0 flex items-center justify-center"
        style={{ top: v.frame.top, width: v.frame.width, height: v.frame.height }}
      >
        <div className="flex-none rotate-[6.13deg]">
          <div className="relative" style={{ width: v.bowl.width, height: v.bowl.height }}>
            <div className="absolute" style={{ inset: "-0.4% -0.25%" }}>
              <img alt="" className="block size-full max-w-none" src={`${base}/bowl.svg`} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute" style={dotsMask}>
        <div className="absolute" style={{ inset: v.dotsInset }}>
          <img alt="" className="block size-full max-w-none" src={`${base}/dots.svg`} />
        </div>
      </div>
      <div className="absolute" style={{ inset: "20.91% 11.97% 20.83% 17.35%" }}>
        <img alt="" className="absolute inset-0 block size-full max-w-none" src={`${base}/wordmark.svg`} />
      </div>
    </div>
  );
}
