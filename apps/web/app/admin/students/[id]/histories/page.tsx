'use client';

import { use } from 'react';
import { StudentDetailScreen } from '@/features/students/StudentDetailScreen';

// admin.domain.com/students/{id}/histories — 장애학생 상세 · 취소·노쇼 이력 (A-06)
export default function AdminStudentHistoriesPage({
  params,
}: PageProps<'/admin/students/[id]/histories'>) {
  const { id } = use(params);
  return <StudentDetailScreen key={id} accountId={Number(id)} tab="histories" />;
}
