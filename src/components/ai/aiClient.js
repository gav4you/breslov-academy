import { base44 } from '@/api/base44Client';

export async function requestAiTutorResponse(payload) {
  return base44.request('/ai/chat', {
    method: 'POST',
    body: payload,
  });
}
