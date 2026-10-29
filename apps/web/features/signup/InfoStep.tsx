'use client';

import { Block, Button, ErrorNotice, OptionTile, TextField } from '@hankki/ui';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import { PasswordRules } from '@/features/auth/PasswordRules';
import { PASSWORD_MAX_LENGTH } from '@/lib/auth/password-policy';
import type { SignupFailure } from './api';
import {
  SIGNUP_FIELDS,
  validateSignup,
  type SignupErrors,
  type SignupField,
  type SignupForm,
} from './signup-form';

/**
 * L-02 회원가입 · 2 정보 입력 (Figma 14:1032). 제출 때 검증해 오류 요약(assertive)을 띄우고 첫 오류 칸으로 포커스한다.
 * 서버가 중복으로 거절한 칸(failure.field)도 그 칸 오류로 보이고 포커스한다.
 * 입력값은 1단계에 다녀와도 남도록 화면(HelperSignupScreen)이 갖는다.
 */
export function InfoStep({
  form,
  setForm,
  submitting,
  failure,
  onSubmit,
}: {
  form: SignupForm;
  setForm: Dispatch<SetStateAction<SignupForm>>;
  submitting: boolean;
  failure: SignupFailure | null;
  onSubmit: (form: SignupForm) => void;
}) {
  const [errors, setErrors] = useState<SignupErrors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const rulesId = useId();

  // 1단계에서 넘어오면 이 단계 제목부터 읽는다
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const focusField = (field: SignupField) => {
    const input = formRef.current?.elements.namedItem(field);
    if (input instanceof HTMLInputElement) input.focus();
  };

  useEffect(() => {
    if (failure?.field) focusField(failure.field);
  }, [failure]);

  const update = (field: SignupField) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const errorOf = (field: SignupField) =>
    errors[field] ?? (failure?.field === field ? failure.message : undefined);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateSignup(form);
    setErrors(found);
    const first = SIGNUP_FIELDS.find((field) => found[field]);
    if (first) {
      const count = Object.keys(found).length;
      setSummary(`입력한 내용을 확인해 주세요 (${count}곳)`);
      focusField(first);
      return;
    }
    setSummary(null);
    onSubmit(form);
  };

  const alert = summary ?? (failure && !failure.field ? failure.message : null);

  return (
    <Block>
      <p className="typo-caption-strong text-(--color-text-brand)">2 / 2 · 정보 입력</p>
      <h2 ref={titleRef} tabIndex={-1} className="typo-title w-full">
        도우미로 함께해요
      </h2>
      {alert && <ErrorNotice message={alert} />}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-(--space-sm)"
        noValidate
      >
        <TextField
          label="이름"
          name="name"
          autoComplete="name"
          placeholder="이름"
          required
          value={form.name}
          error={errorOf('name')}
          onChange={update('name')}
        />
        <TextField
          label="학번"
          name="studentNo"
          inputMode="numeric"
          placeholder="학번 8자리"
          required
          value={form.studentNo}
          error={errorOf('studentNo')}
          onChange={update('studentNo')}
        />
        <TextField
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="example@mju.ac.kr"
          helper="로그인 아이디로 써요"
          required
          value={form.email}
          error={errorOf('email')}
          onChange={update('email')}
        />
        <TextField
          label="카톡 ID"
          name="kakaoId"
          autoCapitalize="none"
          placeholder="카톡 ID"
          helper="매칭된 학생에게만 보여요"
          required
          value={form.kakaoId}
          error={errorOf('kakaoId')}
          onChange={update('kakaoId')}
        />
        <TextField
          label="전화번호"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          helper="센터만 봐요 (긴급 연락용)"
          required
          value={form.phone}
          error={errorOf('phone')}
          onChange={update('phone')}
        />
        {/* 목업 도움말("8~64자, 영문·숫자·특수문자 각 1개 이상") 대신 명세 "비밀번호 규칙 UI (S-PW, L-02, L-03 공통)" 체크리스트 */}
        <TextField
          label="비밀번호"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          describedBy={rulesId}
          value={form.password}
          error={errorOf('password')}
          onChange={update('password')}
        />
        <PasswordRules id={rulesId} value={form.password} />
        <TextField
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          placeholder="한 번 더 입력해 주세요"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          value={form.passwordConfirm}
          error={errorOf('passwordConfirm')}
          onChange={update('passwordConfirm')}
        />
        <OptionTile
          selected={form.attiMember}
          onClick={() => setForm((prev) => ({ ...prev, attiMember: !prev.attiMember }))}
        >
          아띠 소속이에요 (선택)
        </OptionTile>
        <Button type="submit" inactive={submitting} className="w-full">
          가입하기
        </Button>
      </form>
    </Block>
  );
}
