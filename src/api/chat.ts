import type { ChatMessage, SendMessageResponse, StartCaseResponse } from '../types/api'
import { request } from './client'

export const chatApi = {
  getMessages: (caseId: string) =>
    request<ChatMessage[]>(`/cases/${caseId}/messages`),

  sendMessage: (payload: { caseId: string; content: string }) =>
    request<SendMessageResponse>('/chat', { method: 'POST', body: payload }),

  startCase: (initialMessage: string) =>
    request<StartCaseResponse>('/chat/start', {
      method: 'POST',
      body: { message: initialMessage },
    }),
}
