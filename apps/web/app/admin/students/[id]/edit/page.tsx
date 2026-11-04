'use client';

import { use } from 'react';
import { StudentEditScreen } from '@/features/students/StudentEditScreen';

// admin.domain.com/students/{id}/edit — 장애학생 정보 수정 (A-06, 전체 권한만)
export default function AdminStudentEditPage({ params }: PageProps<'/admin/students/[id]/edit'>) {
  const { id } = use(params);
  return <StudentEditScreen key={id} accountId={Number(id)} />;
}
