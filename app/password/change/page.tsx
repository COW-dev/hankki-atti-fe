"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@/components/ui/Icon";
import { ErrorNotice } from "@/components/ui/Notice";
import { Block, PageShell } from "@/components/layout/PageShell";
import { TextField } from "@/components/ui/TextField";
import { TopBar } from "@/components/layout/TopBar";
import { ApiError } from "@/lib/api/client";
import { ErrorCode } from "@/lib/api/error-codes";
import { useAuth } from "@/lib/auth/AuthProvider";
import { checkPassword, PASSWORD_MAX_LENGTH } from "@/lib/auth/password-policy";

// 규칙 아이콘은 Figma에서 16px(캡션 14px 기준) — 큰 글씨에서도 글자와 같은 비율로 커지게 한다
const RULE_ICON_SIZE = "calc(var(--font-caption) * 8 / 7)";

// S-PW 첫 로그인 비밀번호 변경 (Figma 206:1115)
export default function PasswordChangePage() {
  const router = useRouter();
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currentError, setCurrentError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const results = checkPassword(next);
  const remaining = results.filter((rule) => !rule.passed).length;
  const confirmError = confirm.length > 0 && confirm !== next ? "새 비밀번호와 같게 입력해 주세요" : undefined;
  const ready = current.length > 0 && remaining === 0 && confirm.length > 0 && confirm === next;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setNotice(null);
    setCurrentError(undefined);
    try {
      await changePassword(current, next);
      router.replace("/");
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.CURRENT_PASSWORD_MISMATCH) {
        setCurrentError("받은 비밀번호가 맞지 않아요");
      } else if (error instanceof ApiError && error.code === ErrorCode.UNAUTHENTICATED) {
        router.replace("/login");
      } else {
        setNotice(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell size="L" topBar={<TopBar title="비밀번호 변경" logo />} footer={<Footer />}>
      <Block>
        <h2 className="typo-title w-full">처음 로그인하셨어요</h2>
        <p className="typo-body w-full text-(--color-text-secondary)">안전을 위해 비밀번호를 바꿔 주세요</p>
        {notice && <ErrorNotice message={notice} />}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-(--space-sm)" noValidate>
          <TextField
            label="받은 비밀번호"
            type="password"
            autoComplete="current-password"
            placeholder="이메일로 받은 비밀번호"
            required
            value={current}
            error={currentError}
            onChange={(event) => setCurrent(event.target.value)}
          />
          <TextField
            label="새 비밀번호"
            type="password"
            autoComplete="new-password"
            placeholder="새 비밀번호"
            required
            maxLength={PASSWORD_MAX_LENGTH}
            describedBy="password-rules"
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
          <ul id="password-rules" aria-live="polite" className="flex w-full flex-col gap-1.5">
            {results.map((rule) => (
              <li key={rule.label} className="flex items-center gap-1.5">
                <Icon name={rule.passed ? "check" : "dash"} size={RULE_ICON_SIZE} />
                <span
                  className={`whitespace-nowrap ${
                    rule.passed
                      ? "typo-caption-strong text-(--color-text-brand)"
                      : "typo-caption text-(--color-text-secondary)"
                  }`}
                >
                  {rule.passed ? rule.label : `${rule.label} — 아직 없어요`}
                </span>
              </li>
            ))}
          </ul>
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
            aria-describedby="password-change-guide"
            className="w-full"
          >
            비밀번호 바꾸기
          </Button>
          <p id="password-change-guide" className="typo-caption w-full text-center text-(--color-text-secondary)">
            {/* 못 누르는 버튼은 이유를 읽어 준다 (A11Y 공통 규칙) — 화면에는 Figma 문구만 보인다 */}
            {!ready && (
              <span className="sr-only">{`조건 ${remaining + (confirm.length > 0 && confirm === next ? 0 : 1)}개 남음. `}</span>
            )}
            바꾸기 전에는 다른 화면을 쓸 수 없어요
          </p>
        </form>
      </Block>
    </PageShell>
  );
}
