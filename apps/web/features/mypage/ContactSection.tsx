'use client';

import { Block, Button, ErrorNotice, TextField } from '@hankki/ui';
import { useRef, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { updateContact } from './api';
import {
  CONTACT_FIELDS,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactForm,
} from './contact-form';
import type { MyProfile } from './types';
import { errorMessage } from '@/lib/api/error-message';

// F-05 도우미 연락 정보 수정 (Figma 14:1212). 저장 때 검증하고 첫 오류 칸으로 포커스한다. 오류 문구는 목업에 없어 임시로 둔다
export function ContactSection({
  profile,
  onSaved,
}: {
  profile: MyProfile;
  onSaved: (profile: MyProfile) => void;
}) {
  const { authRequest } = useAuth();
  const [form, setForm] = useState<ContactForm>({
    kakaoId: profile.kakaoId,
    phone: profile.phone,
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const update = (field: ContactField) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const found = validateContact(form);
    setErrors(found);
    setFailure(null);
    const first = CONTACT_FIELDS.find((field) => found[field]);
    if (first) {
      const input = formRef.current?.elements.namedItem(first);
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }
    setSaving(true);
    try {
      const saved = await updateContact(authRequest, form);
      // 서버가 전화번호 형식을 맞춰 저장하므로(010-1234-5678) 저장된 값으로 칸을 맞춘다
      setForm({ kakaoId: saved.kakaoId, phone: saved.phone });
      onSaved(saved);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Block>
      <h2 className="typo-label text-(--color-text-primary)">연락 정보</h2>
      {failure && <ErrorNotice message={failure} />}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-(--space-sm)"
        noValidate
      >
        <TextField
          label="카톡 ID"
          name="kakaoId"
          autoComplete="off"
          required
          helper="매칭된 학생에게만 보여요"
          value={form.kakaoId}
          error={errors.kakaoId}
          onChange={update('kakaoId')}
        />
        <TextField
          label="전화번호"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          helper="센터만 봐요"
          value={form.phone}
          error={errors.phone}
          onChange={update('phone')}
        />
        <div className="flex w-full justify-end">
          <Button type="submit" variant="secondary" size="small" inactive={saving}>
            저장
          </Button>
        </div>
      </form>
    </Block>
  );
}
