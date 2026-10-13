// BID — Endpoints de casos (idea cases) contra el backend.
// Port de FronHack src/api/cases.ts: CRUD sobre /cases.

import { request } from './client.js';

export const casesApi = {
  list: (page = 1, pageSize = 20) =>
    request('/cases', { params: { page, pageSize } }),

  get: (id) => request(`/cases/${id}`),

  create: (data) => request('/cases', { method: 'POST', body: data }),

  update: (id, data) => request(`/cases/${id}`, { method: 'PATCH', body: data }),

  archive: (id) => request(`/cases/${id}`, { method: 'DELETE' }),
};
