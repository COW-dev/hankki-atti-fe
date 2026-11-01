import { Block, StatusTag } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import type { MyProfile } from './types';

function rowsOf(profile: MyProfile) {
  if (profile.helper) {
    return [
      { label: '학번', value: profile.studentNo },
      { label: '이메일 (아이디)', value: profile.loginId },
      { label: '봉사시간', value: `누적 ${profile.helper.volunteerHours}시간` },
    ];
  }
  return [
    { label: '학번', value: profile.studentNo },
    { label: '카톡 ID', value: profile.kakaoId },
    { label: '전화번호', value: profile.phone },
  ];
}

// F-05 내 정보 (Figma 14:956 장애학생, 14:1194 도우미). 장애학생 정보는 센터가 관리해 조회만 한다
export function ProfileSection({ profile }: { profile: MyProfile }) {
  return (
    <Block>
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full items-center gap-3 pb-2">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-(--radius-full) bg-(--color-bg-muted)">
            <Icon name="tab-mypage-active" size="calc(var(--icon-size) * 0.81)" />
          </span>
          <div className="flex min-w-px flex-col items-start gap-1">
            <h2 className="typo-title text-(--color-text-primary)">{profile.name}</h2>
            <div className="flex flex-wrap gap-1.5">
              <StatusTag type="info">{profile.helper ? '도우미' : '장애학생'}</StatusTag>
              {profile.helper?.attiMember && <StatusTag type="neutral">아띠 (자기신고)</StatusTag>}
            </div>
          </div>
        </div>
        <dl className="flex w-full flex-col gap-1">
          {rowsOf(profile).map((row) => (
            <div
              key={row.label}
              className="flex w-full items-center gap-3 border-t border-(--color-border-default) py-3.5"
            >
              <dt className="typo-body min-w-px flex-1 text-(--color-text-secondary)">
                {row.label}
              </dt>
              {/* 큰 글씨에서 긴 이메일이 칸을 넘지 않게 줄을 바꾼다 */}
              <dd className="typo-body-strong min-w-px text-right break-all text-(--color-text-primary)">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        {!profile.helper && (
          <p className="typo-caption w-full text-(--color-text-secondary)">
            정보 수정은 센터에 요청해 주세요
          </p>
        )}
      </div>
    </Block>
  );
}
