import type {
  CaseListResponse,
  CreateCaseInput,
  IdeaCase,
  UpdateCaseInput,
  WireCaseListResponse,
  WireIdeaCase,
} from '../types/api'
import { request } from './client'

function mapCase(wire: WireIdeaCase): IdeaCase {
  return {
    id: wire.id,
    title: wire.title,
    summary: wire.description,
    updatedAt: wire.updated_at,
    status: wire.status,
  }
}

export const casesApi = {
  list: async (limit = 10, offset = 0): Promise<CaseListResponse> => {
    const wire = await request<WireCaseListResponse>('/cases/', {
      params: { limit, offset },
    })
    return {
      data: (wire.data ?? []).map(mapCase),
      total: wire.total,
      limit: wire.limit,
      offset: wire.offset,
    }
  },

  get: async (id: string): Promise<IdeaCase> =>
    mapCase(await request<WireIdeaCase>(`/cases/${id}`)),

  create: async (data: CreateCaseInput): Promise<IdeaCase> =>
    mapCase(await request<WireIdeaCase>('/cases/', { method: 'POST', body: data })),

  update: async (id: string, data: UpdateCaseInput): Promise<IdeaCase> =>
    mapCase(await request<WireIdeaCase>(`/cases/${id}`, { method: 'PATCH', body: data })),

  archive: (id: string) => request<null>(`/cases/${id}`, { method: 'DELETE' }),
}
