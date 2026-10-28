import { Icon } from '@hankki/icons';
import { checkPassword } from '@/lib/auth/password-policy';

// 규칙 아이콘은 Figma에서 16px(캡션 14px 기준) — 큰 글씨에서도 글자와 같은 비율로 커지게 한다
const RULE_ICON_SIZE = 'calc(var(--font-caption) * 8 / 7)';

/**
 * 비밀번호 조건 체크리스트 (Figma S-PW 206:1115 · L-03 204:949). 명세 "비밀번호 규칙 UI (S-PW, L-02, L-03 공통)":
 * 조건마다 충족/"아직 없어요"를 글자로 보이고, 입력 칸이 aria-describedby로 이 목록을 가리킨다.
 */
export function PasswordRules({ id, value }: { id: string; value: string }) {
  return (
    <ul id={id} aria-live="polite" className="flex w-full flex-col gap-1.5">
      {checkPassword(value).map((rule) => (
        <li key={rule.label} className="flex items-center gap-1.5">
          <Icon name={rule.passed ? 'check' : 'dash'} size={RULE_ICON_SIZE} />
          <span
            className={`whitespace-nowrap ${
              rule.passed
                ? 'typo-caption-strong text-(--color-text-brand)'
                : 'typo-caption text-(--color-text-secondary)'
            }`}
          >
            {rule.passed ? rule.label : `${rule.label} — 아직 없어요`}
          </span>
        </li>
      ))}
    </ul>
  );
}
