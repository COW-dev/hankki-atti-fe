import { StatusTag } from '@hankki/ui';
import { formatDateTime, parseLocalDateTime } from '@/lib/format/datetime';
import { APPLICATION_STATUS } from '@/lib/labels/application';
import { pastActivityNote } from './past-note';
import type { MyApplication } from './types';

// F-07 지난 활동 행 (Figma 208:3424): 일시 + 부가 문구(있을 때만) · 오른쪽 상태 태그
export function PastApplicationRow({ application }: { application: MyApplication }) {
  const status = APPLICATION_STATUS[application.status];
  const note = pastActivityNote(application);

  return (
    <li className="flex w-full items-center gap-(--space-sm) border-t border-(--color-border-default) py-3.5 first:border-t-0">
      <div className="flex min-w-px flex-1 flex-col items-start gap-0.5">
        <p className="typo-body-strong text-(--color-text-primary)">
          {formatDateTime(parseLocalDateTime(application.startAt))}
        </p>
        {note && <p className="typo-caption text-(--color-text-secondary)">{note}</p>}
      </div>
      <StatusTag type={status.type} className="shrink-0">
        {status.label}
      </StatusTag>
    </li>
  );
}
