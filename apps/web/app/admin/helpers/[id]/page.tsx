'use client';

import { use } from 'react';
import { HelperDetailScreen } from '@/features/helpers/HelperDetailScreen';

// admin.domain.com/helpers/{id} — 도우미 상세 (A-09~A-11)
export default function AdminHelperDetailPage({ params }: PageProps<'/admin/helpers/[id]'>) {
  const { id } = use(params);
  return <HelperDetailScreen key={id} helperId={Number(id)} />;
}
