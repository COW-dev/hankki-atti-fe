'use client';

import { use } from 'react';
import { StudentDetailScreen } from '@/features/students/StudentDetailScreen';

// admin.domain.com/students/{id}/requests — 장애학생 상세 · 매칭현황 (A-06)
export default function AdminStudentRequestsPage({
  params,
}: PageProps<'/admin/students/[id]/requests'>) {
  const { id } = use(params);
  return <StudentDetailScreen key={id} accountId={Number(id)} tab="requests" />;
}
