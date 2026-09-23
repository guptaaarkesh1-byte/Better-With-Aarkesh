import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import {
  TextB,
  TextItalic,
  ListNumbers,
  ListBullets,
  Quotes,
  Image as ImageIcon
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function MenuBar({ editor }) {
  if (!editor) {
    return null;
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Strict validation: under 200 KB
    const MAX_SIZE_BYTES = 200 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeKB = (file.size / 1024).toFixed(1);
      alert(`Image is ${sizeKB} KB. Max allowed file size is Under 200 KB. Please compress your image.`);
      event.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      editor.chain().focus().setImage({ src: `${API_URL}${data.imageUrl}` }).run();
    } catch (error) {
      console.error(error);
      alert('Unable to upload image right now.');
    }
    
    event.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-white/10 bg-[#111]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'text-[#c79c6e] bg-[#c79c6e]/15 font-bold' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Bold"
      >
        <TextB size={18} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Italic"
      >
        <TextItalic size={18} />
      </button>

      <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 text-sm font-sans font-bold rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 text-sm font-sans font-bold rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1 text-sm font-sans font-bold rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        H3
      </button>

      <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Bullet List"
      >
        <ListBullets size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Ordered List"
      >
        <ListNumbers size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Blockquote"
      >
        <Quotes size={18} />
      </button>

      <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

      <label className="p-2 rounded transition-colors text-white/70 hover:text-white hover:bg-white/10 cursor-pointer flex items-center justify-center" title="Insert Image">
        <ImageIcon size={18} />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </label>

      <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        Left
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        Center
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'text-[#c79c6e] bg-[#c79c6e]/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        Right
      </button>

      <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

      <div className="flex items-center gap-2 px-2">
        <label className="text-xs text-white/50 uppercase tracking-widest font-semibold">Color</label>
        <input
          type="color"
          onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#ffffff'}
          className="w-6 h-6 p-0 border-0 rounded bg-transparent cursor-pointer"
          title="Text Color"
        />
      </div>
    </div>
  );
}

export default function TiptapEditor({ value, content, onChange }) {
  const initialData = value !== undefined ? value : content !== undefined ? content : '';

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg' } }),
    ],
    content: initialData,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[480px] p-6 text-white/85 text-sm sm:text-base leading-relaxed font-sans prose-headings:font-bold prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-h2:text-[#c79c6e] prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:font-bold prose-p:my-2 prose-p:text-white/80 prose-strong:text-white prose-strong:font-bold prose-ul:text-white/80 prose-li:my-1.5 prose-a:text-[#c79c6e] custom-scrollbar',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (onChange) {
        onChange(currentEditor.getHTML());
      }
    },
  });

  useEffect(() => {
    const currentVal = value !== undefined ? value : content !== undefined ? content : '';
    if (editor && currentVal !== editor.getHTML()) {
      editor.commands.setContent(currentVal || '', false);
    }
  }, [editor, value, content]);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-[#c79c6e]/50 transition-colors bg-[#0a0a0a]">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-transparent" />
    </div>
  );
}
