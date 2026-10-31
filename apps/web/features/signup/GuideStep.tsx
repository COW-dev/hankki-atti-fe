'use client';

import { Block, Button, OptionTile, StatusTag } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { useEffect, useId, useRef, useState } from 'react';
import { SIGNUP_GUIDES, type GuideType } from './guides';

/**
 * L-02 회원가입 · 1 안내 자료 확인 (Figma 14:989). 펼친 자료에서 "읽었어요"를 눌러야 하고,
 * 7개를 다 읽기 전에는 다음이 inactive이며 남은 개수를 이유로 읽어 준다.
 */
export function GuideStep({
  read,
  onToggleRead,
  onNext,
  focusTitle,
}: {
  read: ReadonlySet<GuideType>;
  onToggleRead: (type: GuideType) => void;
  onNext: () => void;
  focusTitle: boolean;
}) {
  const [open, setOpen] = useState<GuideType | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const remainingId = useId();
  const listId = useId();
  const remaining = SIGNUP_GUIDES.length - read.size;

  useEffect(() => {
    if (focusTitle) titleRef.current?.focus();
  }, [focusTitle]);

  return (
    <>
      <Block>
        <p className="typo-caption-strong text-(--color-text-brand)">1 / 2 · 안내 자료 확인</p>
        <h2 ref={titleRef} tabIndex={-1} className="typo-title w-full">
          가입 전에 꼭 읽어 주세요
        </h2>
        <p className="typo-body text-(--color-text-secondary)">
          장애 유형별로 식사 도움 때 알아 둘 내용이에요
        </p>
      </Block>
      <section className="w-full bg-(--color-bg-default) px-(--space-lg) py-2">
        <ul className="flex w-full flex-col">
          {SIGNUP_GUIDES.map((guide, index) => {
            const expanded = open === guide.type;
            const done = read.has(guide.type);
            const panelId = `${listId}-${guide.type}`;
            return (
              <li
                key={guide.type}
                className={`flex flex-col gap-3 py-4 ${index > 0 ? 'border-t border-(--color-border-default)' : ''}`}
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? null : guide.type)}
                  className="flex min-h-(--control-height) w-full items-center gap-2 text-left"
                >
                  <span className="typo-body-strong min-w-0 flex-1">{guide.name}</span>
                  {/* 접힌 채 읽은 자료는 태그로 보인다 (목업 시각·청각) */}
                  {done && !expanded ? (
                    <StatusTag tone="success">읽었어요</StatusTag>
                  ) : (
                    <Icon name={expanded ? 'minus' : 'chevron-right'} />
                  )}
                </button>
                {expanded && (
                  <div id={panelId} className="flex flex-col gap-3">
                    <p className="typo-caption w-full rounded-(--radius-md) bg-(--color-bg-muted) p-3.5 text-(--color-text-secondary)">
                      {guide.content ?? '자료 준비 중 — 센터·아띠가 만들 예정이에요'}
                    </p>
                    <OptionTile selected={done} onClick={() => onToggleRead(guide.type)}>
                      읽었어요
                    </OptionTile>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p
          id={remainingId}
          aria-live="polite"
          className="typo-caption-strong w-full pb-2 text-center text-(--color-text-secondary)"
        >
          {remaining > 0 ? `${remaining}개 남았어요` : ''}
        </p>
      </section>
      <Block>
        <Button
          inactive={remaining > 0}
          aria-describedby={remaining > 0 ? remainingId : undefined}
          onClick={onNext}
          className="w-full"
        >
          다음
        </Button>
      </Block>
    </>
  );
}
