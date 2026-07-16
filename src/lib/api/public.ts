import { api } from './client';
import type { RequestOptions } from './client';
import type { Article, Category, Module, Paginated, SearchResult, Video } from '../types';

/**
 * Customer Portal API surface — read-only, published content. Uses Next.js ISR
 * (revalidate) so hot pages are served from the edge cache, letting the origin
 * comfortably handle hundreds of concurrent readers.
 */
const REVALIDATE = 60;

type ListParams = Record<string, string | number | boolean | undefined>;

function qs(params: ListParams = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const publicApi = {
  modules: (params?: ListParams) =>
    api.get<Paginated<Module>>(`/api/public/modules${qs(params)}`, { next: { revalidate: REVALIDATE } }),
  module: (slug: string) =>
    api.get<Module>(`/api/public/modules/${slug}`, { next: { revalidate: REVALIDATE } }),

  categories: (params?: ListParams) =>
    api.get<Paginated<Category>>(`/api/public/categories${qs(params)}`, { next: { revalidate: REVALIDATE } }),
  category: (slug: string) =>
    api.get<Category>(`/api/public/categories/${slug}`, { next: { revalidate: REVALIDATE } }),

  articles: (params?: ListParams) =>
    api.get<Paginated<Article>>(`/api/public/articles${qs(params)}`, { next: { revalidate: REVALIDATE } }),
  article: (slug: string) =>
    api.get<Article>(`/api/public/articles/${slug}`, { next: { revalidate: 30 } }),

  videos: (params?: ListParams) =>
    api.get<Paginated<Video>>(`/api/public/videos${qs(params)}`, { next: { revalidate: REVALIDATE } }),
  video: (id: string) =>
    api.get<Video>(`/api/public/videos/${id}`, { next: { revalidate: 30 } }),

  search: (q: string, limit = 10, options?: Pick<RequestOptions, 'signal'>) =>
    api.get<SearchResult>(`/api/public/search${qs({ q, limit })}`, { cache: 'no-store', ...options }),
};
