// BID — Endpoints de chat contra el backend.
// Port de FronHack src/api/chat.ts: mensajes por caso y arranque de conversación.

import { request } from './client.js';

export const chatApi = {
  getMessages: (caseId) => request(`/cases/${caseId}/messages`),

  sendMessage: (payload) => request('/chat', { method: 'POST', body: payload }),

  startCase: (initialMessage) =>
    request('/chat/start', { method: 'POST', body: { message: initialMessage } }),
};
