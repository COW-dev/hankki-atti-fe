import { TabNav } from '@hankki/ui';

const TABS = [
  { href: '/students', label: '학생 목록' },
  { href: '/students/requests', label: '전체 신청 현황' },
] as const;

// Figma 14:1294 · 14:1567 탭
export function StudentTabs({ active }: { active: (typeof TABS)[number]['href'] }) {
  return <TabNav label="장애학생 관리 보기" items={TABS} current={active} />;
}
