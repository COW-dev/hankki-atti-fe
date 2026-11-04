'use client';

const ARROW_CLASS =
  'typo-body flex size-(--control-height) items-center justify-center text-(--color-text-secondary) aria-disabled:text-(--color-text-disabled)';

/**
 * 관리자 목록 페이지 이동 (real_page 14:1424). page는 0부터 센다.
 * 누르는 영역은 크기 모드 높이를 지킨다 (목업 현재 페이지 32 → control/height).
 * 끝에서는 disabled 대신 aria-disabled로 두어 포커스를 잃지 않게 한다.
 */
export function Pagination({
  label,
  page,
  totalPages,
  onChange,
}: {
  label: string;
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const move = (next: number) => {
    if (next >= 0 && next < totalPages && next !== page) onChange(next);
  };
  return (
    <nav aria-label={label} className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="이전 페이지"
        aria-disabled={page === 0 || undefined}
        onClick={() => move(page - 1)}
        className={ARROW_CLASS}
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1}페이지`}
          aria-current={index === page ? 'page' : undefined}
          onClick={() => move(index)}
          className={`typo-caption-strong flex size-(--control-height) items-center justify-center rounded-(--radius-sm) ${
            index === page
              ? 'bg-(--color-bg-brand-selected) text-(--color-text-brand)'
              : 'text-(--color-text-secondary)'
          }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        aria-disabled={page === totalPages - 1 || undefined}
        onClick={() => move(page + 1)}
        className={ARROW_CLASS}
      >
        ›
      </button>
    </nav>
  );
}
