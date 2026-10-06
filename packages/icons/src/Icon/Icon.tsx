/* eslint-disable @next/next/no-img-element -- Figma에서 내려받은 SVG 아이콘을 원본 그대로 쓴다 */

/**
 * 장식용 아이콘 (Figma Icon 68:48). 의미는 옆 텍스트로 전달하므로 스크린리더에서 숨긴다.
 * 크기를 주지 않으면 크기 모드의 icon/size(L 24 · M 20 · 큰 글씨 28)를 따른다.
 * 글자에 맞춰야 하면 CSS 길이 문자열을 준다 (예: "calc(var(--font-caption) * 8 / 7)").
 */
export function Icon({ name, size, className }: { name: string; size?: number | string; className?: string }) {
  const length = size === undefined ? "var(--icon-size)" : typeof size === "number" ? `${size}px` : size;
  return (
    <span
      aria-hidden
      className={`relative inline-block shrink-0 ${className ?? ""}`}
      style={{ width: length, height: length }}
    >
      <img alt="" className="absolute inset-0 block size-full max-w-none" src={`/icons/${name}.svg`} />
    </span>
  );
}
