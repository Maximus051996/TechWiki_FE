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
import type { Category, Module, Status, Video } from '@/lib/types';

export default function AdminVideosPage() {
  return (
    <Protected>
      <AdminShell>
        <VideosManager />
      </AdminShell>
    </Protected>
  );
}

const empty = {
  title: '', moduleId: '', categoryId: '', videoUrl: '', description: '',
  duration: '', tags: [] as string[], status: 'draft' as Status, featured: false,
};

function VideosManager() {
  const { token } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState<Video[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Video> & { tagsText?: string }>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!token) return;
    setLoading(true);
    try {
      const [vids, mods, cats] = await Promise.all([
        adminApi.videos.list(token, { limit: 100 }, { signal }),
        adminApi.modules.list(token, { limit: 200 }, { signal }),
        adminApi.categories.list(token, { limit: 200 }, { signal }),
      ]);
      if (signal?.aborted) return;
      setItems(vids.items);
      setModules(mods.items);
      setCategories(cats.items);
    } catch (err) {
      if (signal?.aborted) return;
      notify(err instanceof ApiError ? err.message : 'Failed to load', 'error');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token, notify]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const catsForModule = categories.filter((c) => c.moduleId === form.moduleId);
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';
  const filtered = items.filter((v) => v.title.toLowerCase().includes(q.toLowerCase()));

  function openCreate() {
    setEditingId(null);
    setForm(empty);
    setDrawerOpen(true);
  }

  function openEdit(v: Video) {
    setEditingId(v.id);
    setForm({
      title: v.title, moduleId: v.moduleId, categoryId: v.categoryId, videoUrl: v.videoUrl,
      description: v.description, duration: v.duration, status: v.status, featured: v.featured,
      tagsText: v.tags.join(', '),
    });
    setDrawerOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    const payload: Partial<Video> = {
      title: form.title, moduleId: form.moduleId, categoryId: form.categoryId,
      videoUrl: form.videoUrl, description: form.description, duration: form.duration,
      status: form.status, featured: form.featured,
      tags: (form.tagsText ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await adminApi.videos.update(token, editingId, payload);
        notify('Video updated', 'success');
      } else {
        await adminApi.videos.create(token, payload);
        notify('Video created', 'success');
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
      await adminApi.videos.remove(token, toDelete.id);
      notify('Video deleted', 'success');
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
        title="Videos"
        subtitle="Curate YouTube videos organized by module and category."
        action={<button className="btn btn-primary" onClick={openCreate} disabled={categories.length === 0}>＋ New Video</button>}
      />

      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search videos by title…" />
        <span className="muted" style={{ fontSize: 13 }}>{filtered.length} shown</span>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Video</th><th>Category</th><th>Status</th><th>Views</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={5}><span className="skeleton" style={{ display: 'block', height: 20 }} /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td className="empty-row" colSpan={5}>🎬 No videos found.</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {v.thumbnail ? <img className="row-thumb" src={v.thumbnail} alt="" loading="lazy" /> : <span className="row-thumb" style={{ display: 'grid', placeItems: 'center' }}>🎬</span>}
                        <div>
                          <div className="cell-title">{v.featured && <span title="Featured">⭐ </span>}{v.title}</div>
                          {v.duration && <div className="muted" style={{ fontSize: 13 }}>⏱ {v.duration}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{catName(v.categoryId)}</span></td>
                    <td><StatusBadge status={v.status} /></td>
                    <td className="muted">👁 {v.views}</td>
                    <td className="cell-actions"><RowActions onEdit={() => openEdit(v)} onDelete={() => setToDelete(v)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        title={editingId ? 'Edit Video' : 'New Video'}
        onClose={() => setDrawerOpen(false)}
        onSubmit={onSubmit}
        submitting={saving}
        submitLabel={editingId ? 'Update Video' : 'Create Video'}
      >
        <Field label="Title">
          <input className="input" required value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
        </Field>
        <Field label="YouTube URL" hint="A valid YouTube link is required">
          <input className="input" required value={form.videoUrl ?? ''} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
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
        <Field label="Description">
          <textarea className="textarea" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this video about?" />
        </Field>
        <div className="form-row">
          <Field label="Duration" hint="e.g. 12:34">
            <input className="input" value={form.duration ?? ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="12:34" />
          </Field>
          <Field label="Tags" hint="Comma separated">
            <input className="input" value={form.tagsText ?? ''} onChange={(e) => setForm({ ...form, tagsText: e.target.value })} placeholder="react, hooks" />
          </Field>
        </div>
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
        title="Delete video?"
        message={`Delete video "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
