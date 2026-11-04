'use client';

import { use } from 'react';
import { StudentDetailScreen } from '@/features/students/StudentDetailScreen';

// admin.domain.com/students/{id} — 장애학생 상세 · 정보 (A-06, 전체 권한만)
export default function AdminStudentInfoPage({ params }: PageProps<'/admin/students/[id]'>) {
  const { id } = use(params);
  return <StudentDetailScreen key={id} accountId={Number(id)} tab="info" />;
}
