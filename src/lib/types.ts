/** Shared domain types mirroring the backend contracts. */

export type Status = 'draft' | 'published' | 'archived';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface Module {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  moduleId: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  moduleId: string;
  categoryId: string;
  shortDescription: string;
  content?: string;
  thumbnail: string;
  bannerImage: string;
  tags: string[];
  status: Status;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  readingTime: number;
  views: number;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  moduleId: string;
  categoryId: string;
  videoUrl: string;
  youtubeId: string;
  thumbnail: string;
  description: string;
  duration: string;
  tags: string[];
  status: Status;
  featured: boolean;
  views: number;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  query: string;
  total: number;
  groups: {
    modules: Module[];
    categories: Category[];
    articles: Article[];
    videos: Video[];
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardSummary {
  totals: { modules: number; categories: number; articles: number; videos: number };
  latestArticles: Article[];
  latestVideos: Video[];
}

export interface Visitor {
  id: string;
  ip: string;
  country: string;
  region: string;
  city: string;
  deviceType: string;
  browser: string;
  os: string;
  path: string;
  referrer: string;
  userAgent: string;
  visitedAt: string;
  createdAt: string;
}

export interface VisitorStatBucket {
  label: string;
  count: number;
}

export interface VisitorStats {
  total: number;
  last24h: number;
  topCountries: VisitorStatBucket[];
  byDevice: VisitorStatBucket[];
  topBrowsers: VisitorStatBucket[];
}
