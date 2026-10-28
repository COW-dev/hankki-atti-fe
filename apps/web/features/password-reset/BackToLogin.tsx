import Link from 'next/link';

// "로그인으로 돌아가기" 글자 링크 (Figma 204:679). 지금 도메인의 로그인으로 간다
export function BackToLogin() {
  return (
    <div className="flex w-full justify-center">
      <Link
        href="/login"
        className="typo-caption-strong flex min-h-(--control-height) items-center text-(--color-text-secondary) underline"
      >
        로그인으로 돌아가기
      </Link>
    </div>
  );
}
