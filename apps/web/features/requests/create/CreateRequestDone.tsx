'use client';

import { useEffect, useRef } from 'react';
import { Block, Button, ButtonLink, StatusTag } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { HELP_REQUEST_STATUS, helpTypesText } from '@/lib/labels/help-request';
import { requestTitle } from '../RequestDateTime';
import type { CreatedHelpRequest } from '../types';

/**
 * F-01 도우미 신청 · 완료 (Figma 206:1648). 같은 화면에서 바뀌므로 결과 제목에 포커스해 읽어 준다.
 */
export function CreateRequestDone({
  request,
  onCreateAnother,
}: {
  request: CreatedHelpRequest;
  onCreateAnother: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const status = HELP_REQUEST_STATUS[request.status];

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <>
      <Block>
        <div className="flex w-full flex-col items-center gap-2.5 pt-6 pb-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-(--color-bg-muted)">
            <Icon name="check" />
          </div>
          <div className="h-0.5" />
          <h2 ref={titleRef} tabIndex={-1} className="typo-title w-full text-center">
            신청했어요! 도우미를 찾고 있어요
          </h2>
          <p className="typo-body w-full text-center text-(--color-text-secondary)">
            정해지면 바로 알려드릴게요
          </p>
        </div>
      </Block>
      {/* 신청 요약 (206:1722) */}
      <section className="flex w-full flex-col gap-1.5 bg-(--color-bg-default) p-(--space-lg)">
        <div>
          <StatusTag tone={status.tone}>{status.label}</StatusTag>
        </div>
        <h3 className="typo-title w-full text-(--color-text-primary)">{requestTitle(request)}</h3>
        <p className="typo-body w-full text-(--color-text-secondary)">
          {helpTypesText(request.helpTypes, request.otherHelpText)}
        </p>
      </section>
      <Block>
        <ButtonLink href="/requests" className="w-full">
          내 신청 보기
        </ButtonLink>
        <Button variant="secondary" onClick={onCreateAnother} className="w-full">
          하나 더 신청하기
        </Button>
      </Block>
    </>
  );
}
