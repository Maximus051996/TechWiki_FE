'use client';

import { useCallback, useEffect, useState } from 'react';
import { Protected } from '@/components/admin/Protected';
import { AdminShell } from '@/components/admin/AdminShell';
import { Drawer } from '@/components/admin/Drawer';
import { Field, PageHead, RowActions, SearchInput, StatusBadge } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { Article, Category, Module, Status } from '@/lib/types';

export default function AdminArticlesPage() {
  return (
    <Protected>
      <AdminShell>
        <ArticlesManager />
      </AdminShell>
    </Protected>
  );
}

const empty = {
  title: '', moduleId: '', categoryId: '', shortDescription: '', content: '',
  tags: [] as string[], status: 'draft' as Status, featured: false,
};

function ArticlesManager() {
  const { token } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState<Article[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Article> & { tagsText?: string }>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [arts, mods, cats] = await Promise.all([
        adminApi.articles.list(token, { limit: 100 }),
        adminApi.modules.list(token, { limit: 200 }),
        adminApi.categories.list(token, { limit: 200 }),
      ]);
      setItems(arts.items);
      setModules(mods.items);
      setCategories(cats.items);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, notify]);

  useEffect(() => { load(); }, [load]);

  const catsForModule = categories.filter((c) => c.moduleId === form.moduleId);
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';
  const filtered = items.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()));

  function openCreate() {
    setEditingId(null);
    setForm(empty);
    setDrawerOpen(true);
  }

  async function openEdit(a: Article) {
    if (!token) return;
    try {
      const full = await adminApi.articles.get(token, a.id);
      setEditingId(a.id);
      setForm({
        title: full.title, moduleId: full.moduleId, categoryId: full.categoryId,
        shortDescription: full.shortDescription, content: full.content, status: full.status,
        featured: full.featured, tagsText: full.tags.join(', '),
      });
      setDrawerOpen(true);
    } catch {
      notify('Failed to load article', 'error');
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    const payload: Partial<Article> = {
      title: form.title, moduleId: form.moduleId, categoryId: form.categoryId,
      shortDescription: form.shortDescription, content: form.content,
      status: form.status, featured: form.featured,
      tags: (form.tagsText ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await adminApi.articles.update(token, editingId, payload);
        notify('Article updated', 'success');
      } else {
        await adminApi.articles.create(token, payload);
        notify('Article created', 'success');
      }
      setDrawerOpen(false);
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!token || !toDelete) return;
    setDeleting(true);
    try {
      await adminApi.articles.remove(token, toDelete.id);
      notify('Article deleted', 'success');
      setToDelete(null);
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 20 }}>
      <PageHead
        title="Articles"
        subtitle="Write and publish rich technical articles for your readers."
        action={<button className="btn btn-primary" onClick={openCreate} disabled={categories.length === 0}>＋ New Article</button>}
      />

      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search articles by title…" />
        <span className="muted" style={{ fontSize: 13 }}>{filtered.length} shown</span>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Status</th><th>Views</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={5}><span className="skeleton" style={{ display: 'block', height: 20 }} /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td className="empty-row" colSpan={5}>📄 No articles found.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="cell-title">{a.featured && <span title="Featured">⭐ </span>}{a.title}</div>
                      <div className="muted" style={{ fontSize: 13 }}>{a.shortDescription || '—'}</div>
                    </td>
                    <td><span className="badge badge-neutral">{catName(a.categoryId)}</span></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="muted">👁 {a.views}</td>
                    <td className="cell-actions"><RowActions onEdit={() => openEdit(a)} onDelete={() => setToDelete(a)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        title={editingId ? 'Edit Article' : 'New Article'}
        onClose={() => setDrawerOpen(false)}
        onSubmit={onSubmit}
        submitting={saving}
        submitLabel={editingId ? 'Update Article' : 'Create Article'}
      >
        <Field label="Title">
          <input className="input" required value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="An engaging article title" />
        </Field>
        <div className="form-row">
          <Field label="Module">
            <select className="select" required value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value, categoryId: '' })}>
              <option value="">Select module…</option>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select className="select" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} disabled={!form.moduleId}>
              <option value="">Select category…</option>
              {catsForModule.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Short description">
          <input className="input" value={form.shortDescription ?? ''} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="A one-line summary shown on cards" />
        </Field>
        <Field label="Content" hint="HTML or markdown supported">
          <textarea className="textarea input-mono" required style={{ minHeight: 180 }} value={form.content ?? ''} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="<h2>Introduction</h2><p>…</p>" />
        </Field>
        <Field label="Tags" hint="Comma separated">
          <input className="input" value={form.tagsText ?? ''} onChange={(e) => setForm({ ...form, tagsText: e.target.value })} placeholder="javascript, nodejs, tutorial" />
        </Field>
        <div className="form-row">
          <Field label="Status">
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Visibility">
            <label className="check">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <span>⭐ Featured</span>
            </label>
          </Field>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete article?"
        message={`Delete article "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
