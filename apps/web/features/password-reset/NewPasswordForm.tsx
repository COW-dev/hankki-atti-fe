'use client';

import { Block, Button, ErrorNotice, TextField } from '@hankki/ui';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { PasswordRules } from '@/features/auth/PasswordRules';
import { checkPassword, PASSWORD_MAX_LENGTH } from '@/lib/auth/password-policy';

/**
 * L-03 새 비밀번호 (Figma 204:875): 새 비밀번호 + 조건 체크리스트 + 확인. 다 채우기 전에는 버튼이 inactive이고
 * 남은 조건 수를 읽어 준다 (명세 "비밀번호 규칙 UI").
 */
export function NewPasswordForm({
  submitting,
  passwordError,
  notice,
  onSubmit,
}: {
  submitting: boolean;
  passwordError?: string;
  notice: string | null;
  onSubmit: (newPassword: string) => void;
}) {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const rulesId = useId();
  const guideId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  // 서버가 새 비밀번호를 거절하면(지금 비밀번호와 같음) 그 칸으로 포커스를 옮긴다 (공통 완료 조건 "첫 오류 포커스")
  useEffect(() => {
    if (!passwordError) return;
    const field = formRef.current?.elements.namedItem('newPassword');
    if (field instanceof HTMLInputElement) field.focus();
  }, [passwordError]);

  const remaining = checkPassword(next).filter((rule) => !rule.passed).length;
  const confirmed = confirm.length > 0 && confirm === next;
  const confirmError =
    confirm.length > 0 && confirm !== next ? '새 비밀번호와 같게 입력해 주세요' : undefined;
  const ready = remaining === 0 && confirmed;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) onSubmit(next);
  };

  return (
    <Block>
      <h2 className="typo-title w-full">새 비밀번호를 만들어 주세요</h2>
      {notice && <ErrorNotice message={notice} />}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-(--space-sm)"
        noValidate
      >
        <TextField
          label="새 비밀번호"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="새 비밀번호"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          describedBy={rulesId}
          value={next}
          error={passwordError}
          onChange={(event) => setNext(event.target.value)}
        />
        <PasswordRules id={rulesId} value={next} />
        <TextField
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          placeholder="한 번 더 입력해 주세요"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          value={confirm}
          error={confirmError}
          onChange={(event) => setConfirm(event.target.value)}
        />
        <Button
          type="submit"
          inactive={!ready || submitting}
          aria-describedby={ready ? undefined : guideId}
          className="w-full"
        >
          비밀번호 바꾸기
        </Button>
        {/* 못 누르는 버튼은 이유를 읽어 준다 (A11Y 공통 규칙) — 목업에 보이는 문구가 없어 화면에는 숨긴다 */}
        {!ready && (
          <p id={guideId} className="sr-only">
            {`조건 ${remaining + (confirmed ? 0 : 1)}개 남음`}
          </p>
        )}
      </form>
    </Block>
  );
}
