'use client';

import { Block, Button, ErrorNotice, TextField } from '@hankki/ui';
import { useState, type FormEvent } from 'react';
import { requestPasswordReset } from './api';
import { BackToLogin } from './BackToLogin';

/** L-03 요청 (Figma 204:601): 아이디 → [재설정 메일 받기]. 계정이 없어도 같은 "보냄" 화면으로 간다 (U-22). */
export function ResetRequestForm({ onSent }: { onSent: (loginId: string) => void }) {
  const [loginId, setLoginId] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = loginId.trim();
    if (!trimmed) {
      setFieldError('아이디를 입력해 주세요');
      // 오류 칸으로 포커스를 옮긴다 (공통 완료 조건 "첫 오류 포커스")
      const field = event.currentTarget.elements.namedItem('loginId');
      if (field instanceof HTMLInputElement) field.focus();
      return;
    }
    setSubmitting(true);
    setFieldError(undefined);
    setNotice(null);
    try {
      await requestPasswordReset(trimmed);
      onSent(trimmed);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Block gap="md">
      <h2 className="typo-title w-full">비밀번호를 잊으셨나요?</h2>
      <p className="typo-body w-full text-(--color-text-secondary)">
        아이디를 입력하면 재설정 링크를 메일로 보내요
      </p>
      {notice && <ErrorNotice message={notice} />}
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-(--space-md)" noValidate>
        <TextField
          label="아이디"
          name="loginId"
          autoComplete="username"
          placeholder="학번 또는 이메일"
          required
          value={loginId}
          error={fieldError}
          onChange={(event) => setLoginId(event.target.value)}
        />
        <Button type="submit" inactive={submitting} className="w-full">
          재설정 메일 받기
        </Button>
      </form>
      <BackToLogin />
    </Block>
  );
}
