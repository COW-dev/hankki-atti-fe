import { Icon } from "@/components/ui/Icon";

/**
 * Figma Notice · Error (70:77). 화면 상단 오류 안내 — 스크린리더가 바로 읽도록 role="alert".
 * Info · Success · Warning은 처음 쓰는 화면에서 Figma를 보고 추가한다.
 */
export function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex w-full items-start gap-(--space-sm) rounded-(--radius-sm) bg-(--color-bg-danger-subtle) px-(--space-md) py-(--space-sm)"
    >
      <Icon name="error" />
      <p className="typo-body min-w-px flex-1 text-(--color-text-primary)">{message}</p>
    </div>
  );
}
