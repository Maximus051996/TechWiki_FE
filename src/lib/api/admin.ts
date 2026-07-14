import { api } from './client';
import type {
  Article, AuthUser, Category, DashboardSummary, Module, Paginated, SearchResult, Video,
  Visitor, VisitorStats,
} from '../types';

/**
 * Admin Portal API surface — authenticated, full CRUD. Every call takes a token.
 */
type Params = Record<string, string | number | boolean | undefined>;

function qs(params: Params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

const noStore = { cache: 'no-store' as const };

export const adminApi = {
  login: (email: string, password: string, remember?: boolean) =>
    api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
      '/api/admin/auth/login',
      { email, password, remember }
    ),
  me: (token: string) => api.get<{ user: AuthUser }>('/api/admin/auth/me', { token, ...noStore }),
  dashboard: (token: string) => api.get<DashboardSummary>('/api/admin/dashboard', { token, ...noStore }),

  visitors: {
    list: (token: string, params?: Params) =>
      api.get<Paginated<Visitor>>(`/api/admin/visitors${qs(params)}`, { token, ...noStore }),
    stats: (token: string) => api.get<VisitorStats>('/api/admin/visitors/stats', { token, ...noStore }),
  },
  search: (token: string, q: string) =>
    api.get<SearchResult>(`/api/admin/search${qs({ q })}`, { token, ...noStore }),

  modules: {
    list: (token: string, params?: Params) =>
      api.get<Paginated<Module>>(`/api/admin/modules${qs(params)}`, { token, ...noStore }),
    get: (token: string, id: string) => api.get<Module>(`/api/admin/modules/${id}`, { token, ...noStore }),
    create: (token: string, data: Partial<Module>) => api.post<Module>('/api/admin/modules', data, { token }),
    update: (token: string, id: string, data: Partial<Module>) =>
      api.put<Module>(`/api/admin/modules/${id}`, data, { token }),
    remove: (token: string, id: string) => api.delete<{ id: string }>(`/api/admin/modules/${id}`, { token }),
  },

  categories: {
    list: (token: string, params?: Params) =>
      api.get<Paginated<Category>>(`/api/admin/categories${qs(params)}`, { token, ...noStore }),
    create: (token: string, data: Partial<Category>) => api.post<Category>('/api/admin/categories', data, { token }),
    update: (token: string, id: string, data: Partial<Category>) =>
      api.put<Category>(`/api/admin/categories/${id}`, data, { token }),
    remove: (token: string, id: string) => api.delete<{ id: string }>(`/api/admin/categories/${id}`, { token }),
  },

  articles: {
    list: (token: string, params?: Params) =>
      api.get<Paginated<Article>>(`/api/admin/articles${qs(params)}`, { token, ...noStore }),
    get: (token: string, id: string) => api.get<Article>(`/api/admin/articles/${id}`, { token, ...noStore }),
    create: (token: string, data: Partial<Article>) => api.post<Article>('/api/admin/articles', data, { token }),
    update: (token: string, id: string, data: Partial<Article>) =>
      api.put<Article>(`/api/admin/articles/${id}`, data, { token }),
    remove: (token: string, id: string) => api.delete<{ id: string }>(`/api/admin/articles/${id}`, { token }),
  },

  videos: {
    list: (token: string, params?: Params) =>
      api.get<Paginated<Video>>(`/api/admin/videos${qs(params)}`, { token, ...noStore }),
    create: (token: string, data: Partial<Video>) => api.post<Video>('/api/admin/videos', data, { token }),
    update: (token: string, id: string, data: Partial<Video>) =>
      api.put<Video>(`/api/admin/videos/${id}`, data, { token }),
    remove: (token: string, id: string) => api.delete<{ id: string }>(`/api/admin/videos/${id}`, { token }),
  },
};
