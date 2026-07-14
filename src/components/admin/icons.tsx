/** Clean, consistent line icons for the admin nav (stroke = currentColor). */
type P = { size?: number };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconDashboard = ({ size = 20 }: P) => (
  <svg {...base(size)}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
);
export const IconModules = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M12 2.5 20 7v10l-8 4.5L4 17V7z" /><path d="M4 7l8 4.5L20 7" /><path d="M12 11.5V21" /></svg>
);
export const IconCategories = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
);
export const IconArticles = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M6 3h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /><path d="M8.5 13h7M8.5 16.5h7" /></svg>
);
export const IconVideos = ({ size = 20 }: P) => (
  <svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M10 9.5v5l4-2.5z" /></svg>
);
export const IconVisitors = ({ size = 20 }: P) => (
  <svg {...base(size)}><circle cx="9" cy="8" r="3" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 5.5a3 3 0 0 1 0 5.4" /><path d="M17.5 20c0-2.3-1-4-2.5-5" /></svg>
);
export const IconExternal = ({ size = 18 }: P) => (
  <svg {...base(size)}><path d="M14 4h6v6" /><path d="M20 4l-8 8" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></svg>
);
export const IconLogout = ({ size = 18 }: P) => (
  <svg {...base(size)}><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const IconBell = ({ size = 18 }: P) => (
  <svg {...base(size)}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
);
