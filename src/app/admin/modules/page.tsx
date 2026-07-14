'use client';

import { useCallback, useEffect, useState } from 'react';
import { Protected } from '@/components/admin/Protected';
import { AdminShell } from '@/components/admin/AdminShell';
import { Drawer } from '@/components/admin/Drawer';
import { Field, PageHead, Pager, RowActions, SearchInput, StatusBadge } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { Module, Status } from '@/lib/types';

export default function AdminModulesPage() {
  return (
    <Protected>
      <AdminShell>
        <ModulesManager />
      </AdminShell>
    </Protected>
  );
}

const empty = { name: '', description: '', icon: '', displayOrder: 0, status: 'draft' as Status };

function ModulesManager() {
  const { token } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Module>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<Module | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.modules.list(token, { q, limit: 100 });
      setItems(data.items);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, q, notify]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(empty);
    setDrawerOpen(true);
  }

  function openEdit(m: Module) {
    setEditingId(m.id);
    setForm({ name: m.name, description: m.description, icon: m.icon, displayOrder: m.displayOrder, status: m.status });
    setDrawerOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.modules.update(token, editingId, form);
        notify('Module updated', 'success');
      } else {
        await adminApi.modules.create(token, form);
        notify('Module created', 'success');
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
      await adminApi.modules.remove(token, toDelete.id);
      notify('Module deleted', 'success');
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
        title="Modules"
        subtitle="Top-level groupings that organize your categories and content."
        action={<button className="btn btn-primary" onClick={openCreate}>＋ New Module</button>}
      />

      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search modules by name…" />
        <span className="muted" style={{ fontSize: 13 }}>{items.length} shown</span>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th><th>Order</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={4}><span className="skeleton" style={{ display: 'block', height: 20 }} /></td></tr>
                ))
              ) : items.length === 0 ? (
                <tr><td className="empty-row" colSpan={4}>📦 No modules yet. Create your first one.</td></tr>
              ) : (
                items.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 22 }}>{m.icon || '📦'}</span>
                        <div>
                          <div className="cell-title">{m.name}</div>
                          <div className="muted" style={{ fontSize: 13 }}>{m.description || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{m.displayOrder}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="cell-actions"><RowActions onEdit={() => openEdit(m)} onDelete={() => setToDelete(m)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        title={editingId ? 'Edit Module' : 'New Module'}
        onClose={() => setDrawerOpen(false)}
        onSubmit={onSubmit}
        submitting={saving}
        submitLabel={editingId ? 'Update Module' : 'Create Module'}
      >
        <div className="form-row">
          <Field label="Name">
            <input className="input" required value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Web Development" />
          </Field>
          <Field label="Icon" hint="An emoji works great">
            <input className="input" value={form.icon ?? ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📦" />
          </Field>
        </div>
        <Field label="Description">
          <textarea className="textarea" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this module cover?" />
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
        title="Delete module?"
        message={`Delete module "${toDelete?.name}"? This will also permanently delete all its categories, articles, and videos. This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
