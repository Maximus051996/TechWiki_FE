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
import type { Category, Module, Status } from '@/lib/types';

export default function AdminCategoriesPage() {
  return (
    <Protected>
      <AdminShell>
        <CategoriesManager />
      </AdminShell>
    </Protected>
  );
}

const empty = { moduleId: '', name: '', description: '', displayOrder: 0, status: 'draft' as Status };

function CategoriesManager() {
  const { token } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [form, setForm] = useState<Partial<Category>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!token) return;
    setLoading(true);
    try {
      const [cats, mods] = await Promise.all([
        adminApi.categories.list(token, { limit: 200 }, { signal }),
        adminApi.modules.list(token, { limit: 200 }, { signal }),
      ]);
      if (signal?.aborted) return;
      setItems(cats.items);
      setModules(mods.items);
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

  const moduleName = (id: string) => modules.find((m) => m.id === id)?.name ?? '—';
  const filtered = items.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  function openCreate() {
    setEditingId(null);
    setForm(empty);
    setDrawerOpen(true);
  }

  function openEdit(c: Category) {
    setEditingId(c.id);
    setForm({ moduleId: c.moduleId, name: c.name, description: c.description, displayOrder: c.displayOrder, status: c.status });
    setDrawerOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.categories.update(token, editingId, form);
        notify('Category updated', 'success');
      } else {
        await adminApi.categories.create(token, form);
        notify('Category created', 'success');
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
      await adminApi.categories.remove(token, toDelete.id);
      notify('Category deleted', 'success');
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
        title="Categories"
        subtitle="Each category belongs to one module and holds articles and videos."
        action={<button className="btn btn-primary" onClick={openCreate} disabled={modules.length === 0}>＋ New Category</button>}
      />

      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search categories by name…" />
        <span className="muted" style={{ fontSize: 13 }}>{filtered.length} shown</span>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th><th>Module</th><th>Order</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={5}><span className="skeleton" style={{ display: 'block', height: 20 }} /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td className="empty-row" colSpan={5}>📁 No categories found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="cell-title">{c.name}</div>
                      <div className="muted" style={{ fontSize: 13 }}>{c.description || '—'}</div>
                    </td>
                    <td><span className="badge badge-neutral">{moduleName(c.moduleId)}</span></td>
                    <td className="muted">{c.displayOrder}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="cell-actions"><RowActions onEdit={() => openEdit(c)} onDelete={() => setToDelete(c)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        title={editingId ? 'Edit Category' : 'New Category'}
        onClose={() => setDrawerOpen(false)}
        onSubmit={onSubmit}
        submitting={saving}
        submitLabel={editingId ? 'Update Category' : 'Create Category'}
      >
        <Field label="Module">
          <select className="select" required value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })}>
            <option value="">Select module…</option>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="Name">
          <input className="input" required value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. JavaScript" />
        </Field>
        <Field label="Description">
          <textarea className="textarea" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this category cover?" />
        </Field>
        <div className="form-row">
          <Field label="Display order" hint="Lower shows first">
            <input className="input" type="number" min={0} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          </Field>
          <Field label="Status">
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        message={`Delete category "${toDelete?.name}"? This will also permanently delete all its articles and videos. This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
