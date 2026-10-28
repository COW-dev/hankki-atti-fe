import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PasswordRules } from './PasswordRules';

describe('PasswordRules', () => {
  it('채운 조건은 이름만, 못 채운 조건은 "아직 없어요"를 붙여 글자로 알린다', () => {
    render(<PasswordRules id="rules" value="hankki2026" />);

    const items = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(items).toEqual(['8자 이상', '영문 포함', '숫자 포함', '특수문자 포함 — 아직 없어요']);
  });
});
