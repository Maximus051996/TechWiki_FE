'use client';

import { memo, useEffect, useState } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Field } from '@/components/admin/ui';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ArticleContent } from '@/components/ArticleContent';
import type { Article, Category, Module, Status } from '@/lib/types';

export interface ArticleFormValues {
  title: string;
  moduleId: string;
  categoryId: string;
  shortDescription: string;
  content: string;
  tagsText: string;
  status: Status;
  featured: boolean;
}

const EMPTY: ArticleFormValues = {
  title: '', moduleId: '', categoryId: '', shortDescription: '', content: '',
  tagsText: '', status: 'draft', featured: false,
};

/**
 * Self-contained article create/edit drawer.
 *
 * Holds ALL form state locally, so typing in the (potentially huge) content
 * textarea only re-renders this component — never the parent page or the data
 * table. This eliminates the keystroke lag. The parent only hears about the
 * final values on submit.
 */
function ArticleFormDrawerBase({
  open,
  editing,
  initial,
  modules,
  categories,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editing: boolean;
  initial: ArticleFormValues | null;
  modules: Module[];
  categories: Category[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: ArticleFormValues) => void;
}) {
  const [form, setForm] = useState<ArticleFormValues>(EMPTY);
  const [preview, setPreview] = useState(false);

  // Re-seed local state only when the drawer opens (or the target changes).
  useEffect(() => {
    if (open) { setForm(initial ?? EMPTY); setPreview(false); }
  }, [open, initial]);

  const set = <K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const catsForModule = categories.filter((c) => c.moduleId === form.moduleId);

  return (
    <Drawer
      open={open}
      title={editing ? 'Edit Article' : 'New Article'}
      onClose={onClose}
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      submitting={saving}
      submitLabel={editing ? 'Update Article' : 'Create Article'}
    >
      <Field label="Title">
        <input className="input" required value={form.title}
          onChange={(e) => set('title', e.target.value)} placeholder="An engaging article title" />
      </Field>

      <div className="form-row">
        <Field label="Module">
          <select className="select" required value={form.moduleId}
            onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value, categoryId: '' }))}>
            <option value="">Select module…</option>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="Category">
          <select className="select" required value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)} disabled={!form.moduleId}>
            <option value="">Select category…</option>
            {catsForModule.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Short description">
        <input className="input" value={form.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)} placeholder="A one-line summary shown on cards" />
      </Field>

      <div className="field">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span className="field-label">Content</span>
          <div className="rte-tabs">
            <button type="button" className={`rte-tab${!preview ? ' active' : ''}`} onClick={() => setPreview(false)}>✎ Edit</button>
            <button type="button" className={`rte-tab${preview ? ' active' : ''}`} onClick={() => setPreview(true)}>👁 Preview</button>
          </div>
        </div>
        <span className="field-hint" style={{ marginBottom: 8 }}>
          Paste from ChatGPT or any tool — formatting, code &amp; diagrams auto-adjust. Drag, paste or upload images.
        </span>
        {preview ? (
          <div className="rte-preview">
            {form.content?.trim()
              ? <ArticleContent content={form.content} />
              : <p className="muted" style={{ margin: 0 }}>Nothing to preview yet.</p>}
          </div>
        ) : (
          <RichTextEditor
            value={form.content}
            onChange={(html) => set('content', html)}
            placeholder="Write or paste your article here…"
          />
        )}
      </div>

      <Field label="Tags" hint="Comma separated">
        <input className="input" value={form.tagsText}
          onChange={(e) => set('tagsText', e.target.value)} placeholder="javascript, nodejs, tutorial" />
      </Field>

      <div className="form-row">
        <Field label="Status">
          <select className="select" value={form.status}
            onChange={(e) => set('status', e.target.value as Status)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Visibility">
          <label className="check">
            <input type="checkbox" checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)} />
            <span>⭐ Featured</span>
          </label>
        </Field>
      </div>
    </Drawer>
  );
}

export const ArticleFormDrawer = memo(ArticleFormDrawerBase);

/** Map an Article (from the API) into form values. */
export function articleToForm(a: Article): ArticleFormValues {
  return {
    title: a.title,
    moduleId: a.moduleId,
    categoryId: a.categoryId,
    shortDescription: a.shortDescription,
    content: a.content ?? '',
    tagsText: a.tags.join(', '),
    status: a.status,
    featured: a.featured,
  };
}
