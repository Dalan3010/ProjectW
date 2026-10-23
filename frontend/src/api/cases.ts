import type { CaseListResponse, IdeaCase } from '../types/api'
import { request } from './client'

export const casesApi = {
  list: (page = 1, pageSize = 20) =>
    request<CaseListResponse>('/cases', { params: { page, pageSize } }),

  get: (id: string) => request<IdeaCase>(`/cases/${id}`),

  create: (data: Partial<IdeaCase>) =>
    request<IdeaCase>('/cases', { method: 'POST', body: data }),

  update: (id: string, data: Partial<IdeaCase>) =>
    request<IdeaCase>(`/cases/${id}`, { method: 'PATCH', body: data }),

  archive: (id: string) => request<null>(`/cases/${id}`, { method: 'DELETE' }),
}
