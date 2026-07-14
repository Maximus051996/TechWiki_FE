'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

/**
 * Smart rich-text editor (TipTap / ProseMirror).
 *
 * Why this fixes the pain points:
 *  - Paste from ChatGPT / any AI tool or doc → ProseMirror normalises the pasted
 *    HTML into a clean document (correct headings, lists, spacing) automatically.
 *  - ASCII diagrams / graphs / charts pasted as code stay in a monospace code
 *    block with preserved alignment.
 *  - Images can be inserted between paragraphs (toolbar button, paste, or drag).
 *  - Output is clean HTML stored as the article `content`.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write or paste your article here…',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: 'md-pre' } },
      }),
      Image.configure({ inline: false, allowBase64: true, HTMLAttributes: { class: 'article-img' } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener', target: '_blank' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'rte-surface article-content' },
      // Drag & drop image files → embed inline.
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) => insertImageFile(file));
        return true;
      },
      // Paste an image (e.g. screenshot) → embed inline.
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imgItem = items.find((i) => i.type.startsWith('image/'));
        if (!imgItem) return false;
        const file = imgItem.getAsFile();
        if (file) {
          event.preventDefault();
          insertImageFile(file);
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChangeRef.current(editor.getHTML());
    },
  });

  // Read an image file and insert it as a data URL at the cursor.
  const insertImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editorRef.current?.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  editorRef.current = editor;

  // Sync external value (e.g. when opening the editor for a different article).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) editor.commands.setContent(value || '', { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return <div className="rte-loading">Loading editor…</div>;
  }

  const addImageByUrl = () => {
    const url = window.prompt('Image URL (or use the upload button to embed a file)');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const pickImageFile = () => fileInputRef.current?.click();

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const Btn = ({ on, active, title, children }: { on: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" title={title} onClick={on} className={`rte-btn${active ? ' active' : ''}`}>
      {children}
    </button>
  );

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><b>B</b></Btn>
        <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><i>I</i></Btn>
        <Btn on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><s>S</s></Btn>
        <span className="rte-sep" />
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</Btn>
        <span className="rte-sep" />
        <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• List</Btn>
        <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1. List</Btn>
        <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote / Note">❝</Btn>
        <span className="rte-sep" />
        <Btn on={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">{'</>'}</Btn>
        <Btn on={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code snippet / ASCII diagram">▤ Code</Btn>
        <span className="rte-sep" />
        <Btn on={setLink} active={editor.isActive('link')} title="Link">🔗</Btn>
        <Btn on={pickImageFile} title="Upload image (embed file)">🖼 Upload</Btn>
        <Btn on={addImageByUrl} title="Insert image by URL">🔗🖼</Btn>
        <span className="rte-sep" />
        <Btn on={() => editor.chain().focus().undo().run()} title="Undo">↶</Btn>
        <Btn on={() => editor.chain().focus().redo().run()} title="Redo">↷</Btn>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((f) => insertImageFile(f));
          e.target.value = '';
        }}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
