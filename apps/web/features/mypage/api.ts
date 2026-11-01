import type { AuthRequest } from '@/features/requests/api';
import type { ContactForm } from './contact-form';
import type { MyProfile } from './types';

export function fetchMyProfile(authRequest: AuthRequest): Promise<MyProfile> {
  return authRequest<MyProfile>('/api/me');
}

// 도우미만 부른다 — 장애학생 연락처는 센터가 관리해 서버가 403을 준다
export function updateContact(authRequest: AuthRequest, form: ContactForm): Promise<MyProfile> {
  return authRequest<MyProfile>('/api/me/contact', {
    method: 'PATCH',
    body: { kakaoId: form.kakaoId, phone: form.phone.trim() },
  });
}

export function updateSmsConsent(authRequest: AuthRequest, consent: boolean): Promise<MyProfile> {
  return authRequest<MyProfile>('/api/me/sms-consent', {
    method: 'PATCH',
    body: { consent },
  });
}
