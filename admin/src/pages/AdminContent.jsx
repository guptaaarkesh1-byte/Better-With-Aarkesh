import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Leaf,
  Shield,
  ArrowsClockwise,
  Signpost,
  Sun,
  Plus,
  CaretDown,
  CaretUp,
  List as DragIcon,
  Trash,
  ArrowLeft,
  MagnifyingGlass,
  Pen,
  ArrowSquareOut,
  Image as ImageIcon,
  TextB,
  TextItalic,
  ListNumbers,
  ListBullets,
  Quotes,
  VideoCamera,
  Article,
  FolderOpen
} from '@phosphor-icons/react';
import AdminBreadcrumb from '../components/ui/AdminBreadcrumb';
import AdminCardPills from '../components/ui/AdminCardPills';
import CollectionManager from '../components/content/CollectionManager';
import { useEditor, EditorContent } from '@tiptap/react';
import VideoManager from '../components/video/VideoManager';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { articleTaxonomy } from '../constants/articleTaxonomy';

const ICON_MAP = { Heart, Leaf, Shield, ArrowsClockwise, Signpost, Sun };
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emptyForm = {
  id: null,
  categoryId: '',
  headingId: '',
  title: '',
  description: '',
  readTime: '',
  status: 'Draft',
  featuredImage: '',
  bodyHtml: '',
};

const buildCategoriesWithArticles = (articles) =>
  articleTaxonomy.map((category) => ({
    ...category,
    headings: category.headings.map((heading) => ({
      ...heading,
      articles: articles
        .filter(
          (article) =>
            article.categoryId === category.id && article.headingId === heading.id
        )
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)),
    })),
  }));

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  actionLabel,
  onAction,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} ref={dropdownRef}>
      <div
        className={`bg-[#0a0a0a] border ${isOpen ? 'border-[#c79c6e]/50' : 'border-white/10'} rounded-lg px-4 py-3 text-white text-sm cursor-pointer flex justify-between items-center transition-colors`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-white' : 'text-white/50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col py-2">
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                  value === opt.value
                    ? 'bg-[#c79c6e]/10 text-[#c79c6e]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
          {actionLabel && onAction && (
            <button
              type="button"
              className="w-full border-t border-white/10 px-4 py-3 text-left text-sm text-[#c79c6e] hover:bg-[#c79c6e]/10 transition-colors"
              onClick={() => {
                onAction();
                setIsOpen(false);
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MenuBar({ editor }) {
  if (!editor) {
    return null;
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        editor.chain().focus().setImage({ src: reader.result }).run();
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-white/10 bg-[#111]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Bold"
      >
        <TextB size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Italic"
      >
        <TextItalic size={18} />
      </button>

      <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 text-sm font-serif font-bold rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 text-sm font-serif font-bold rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1 text-sm font-serif font-bold rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        H3
      </button>

      <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Bullet List"
      >
        <ListBullets size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        title="Ordered List"
      >
        <ListNumbers size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
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
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        Left
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
      >
        Center
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'text-[#c79c6e] bg-[#c79c6e]/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
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

function TiptapArticleEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg' } }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-p:my-2 prose-headings:my-4 prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl max-w-none focus:outline-none min-h-[500px] p-6 text-white/90 text-lg leading-relaxed custom-scrollbar',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-[#c79c6e]/50 transition-colors bg-[#0a0a0a]">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-transparent" />
    </div>
  );
}

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('admin_content_tab') || 'collections';
  });

  useEffect(() => {
    sessionStorage.setItem('admin_content_tab', activeTab);
  }, [activeTab]);
  const [articles, setArticles] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(articleTaxonomy[0].id);
  const [expandedHeadingId, setExpandedHeadingId] = useState(articleTaxonomy[0].headings[0].id);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm, categoryId: articleTaxonomy[0].id });
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customHeadings, setCustomHeadings] = useState({});

  const taxonomyWithCustomHeadings = articleTaxonomy.map((category) => ({
    ...category,
    headings: [...category.headings, ...(customHeadings[category.id] || [])],
  }));

  const categories = buildCategoriesWithArticles(articles).map((category) => ({
    ...category,
    headings: [
      ...category.headings,
      ...(customHeadings[category.id] || []).map((heading) => ({
        ...heading,
        articles: articles
          .filter(
            (article) =>
              article.categoryId === category.id && article.headingId === heading.id
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt || 0) -
              new Date(a.updatedAt || a.createdAt || 0)
          ),
      })),
    ],
  }));
  const activeCategory = categories.find((category) => category.id === activeCategoryId);
  const selectedCategory = taxonomyWithCustomHeadings.find((category) => category.id === form.categoryId);
  const selectedHeading = selectedCategory?.headings.find((heading) => heading.id === form.headingId);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/articles/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load articles from the database.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (nextCategoryId = activeCategoryId) => {
    setForm({ ...emptyForm, categoryId: nextCategoryId });
    setEditingArticleId(null);
  };

  const openArticleEditor = (article) => {
    setForm({
      id: article._id,
      categoryId: article.categoryId,
      headingId: article.headingId,
      title: article.title || '',
      description: article.description || '',
      readTime: article.readTime || '',
      status: article.status || 'Draft',
      featuredImage: article.featuredImage || '',
      bodyHtml: article.bodyHtml || '',
    });
    setEditingArticleId(article._id);
    setMessage('');
  };

  const createNewArticle = () => {
    const defaultHeadingId = activeCategory?.headings?.[0]?.id || '';
    setForm({
      ...emptyForm,
      categoryId: activeCategoryId,
      headingId: defaultHeadingId,
    });
    setEditingArticleId('new');
    setMessage('');
  };

  const closeEditor = () => {
    resetForm();
    setMessage('');
  };

  const toggleHeadingExpand = (headingId) => {
    setExpandedHeadingId((current) => (current === headingId ? null : headingId));
  };

  const getCategoryStats = (category) => ({
    headingsCount: category.headings.length,
    articlesCount: category.headings.reduce(
      (sum, heading) => sum + heading.articles.length,
      0
    ),
  });

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    const nextCategory = taxonomyWithCustomHeadings.find((category) => category.id === categoryId);
    handleFormChange('categoryId', categoryId);
    handleFormChange('headingId', nextCategory?.headings?.[0]?.id || '');
  };

  const handleAddChapter = () => {
    const chapterTitle = window.prompt('Enter the new chapter name');
    if (!chapterTitle) {
      return;
    }

    const normalizedTitle = chapterTitle.trim();
    if (!normalizedTitle) {
      return;
    }

    const nextHeading = {
      id: normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      title: normalizedTitle,
      description: '',
    };

    setCustomHeadings((current) => {
      const existing = current[form.categoryId] || [];
      if (existing.some((heading) => heading.id === nextHeading.id || heading.title.toLowerCase() === normalizedTitle.toLowerCase())) {
        setMessage('That chapter already exists in this category.');
        return current;
      }

      return {
        ...current,
        [form.categoryId]: [...existing, nextHeading],
      };
    });

    handleFormChange('headingId', nextHeading.id);
    setMessage(`Chapter "${normalizedTitle}" added.`);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleFormChange('featuredImage', typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.categoryId || !form.headingId || !form.title.trim()) {
      setMessage('Category, chapter, and article title are required.');
      return;
    }

    const category = articleTaxonomy.find((item) => item.id === form.categoryId);
    const heading = category?.headings.find((item) => item.id === form.headingId);

    if (!category || !heading) {
      setMessage('Please choose a valid category and chapter.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = {
      categoryId: category.id,
      categoryTitle: category.title,
      headingId: heading.id,
      headingTitle: heading.title,
      title: form.title.trim(),
      description: form.description.trim(),
      readTime: form.readTime.trim(),
      status: form.status,
      featuredImage: form.featuredImage,
      bodyHtml: form.bodyHtml,
    };

    try {
      const token = localStorage.getItem('adminToken');
      const isEditing = Boolean(form.id);
      const res = await fetch(
        `${API_URL}/api/articles/admin${isEditing ? `/${form.id}` : ''}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to save article');
      }

      const savedArticle = await res.json();
      setArticles((current) => {
        if (isEditing) {
          return current.map((article) => (article._id === savedArticle._id ? savedArticle : article));
        }
        return [savedArticle, ...current];
      });
      setEditingArticleId(savedArticle._id);
      setForm({
        id: savedArticle._id,
        categoryId: savedArticle.categoryId,
        headingId: savedArticle.headingId,
        title: savedArticle.title || '',
        description: savedArticle.description || '',
        readTime: savedArticle.readTime || '',
        status: savedArticle.status || 'Draft',
        featuredImage: savedArticle.featuredImage || '',
        bodyHtml: savedArticle.bodyHtml || '',
      });
      setActiveCategoryId(savedArticle.categoryId);
      setExpandedHeadingId(savedArticle.headingId);
      setMessage(isEditing ? 'Article updated successfully.' : 'Article uploaded successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to save article right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) {
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/articles/admin/${form.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete article');
      }

      setArticles((current) => current.filter((article) => article._id !== form.id));
      closeEditor();
      setMessage('Article deleted successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete article right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = categories.map((category) => ({
    ...category,
    headings: category.headings.map((heading) => ({
      ...heading,
      articles: heading.articles.filter((article) =>
        [article.title, article.description, article.headingTitle]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    })),
  }));

  const filteredActiveCategory =
    filteredCategories.find((category) => category.id === activeCategoryId) || activeCategory;

  if (editingArticleId) {
    return (
      <div className="p-6 md:p-8 w-full h-[calc(100vh)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans overflow-hidden bg-[#050505]">
        <div className="flex items-center justify-between shrink-0 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={closeEditor}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] border border-white/10 text-white/50 hover:text-white hover:border-[#c79c6e]/50 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-serif text-3xl text-white">
                {form.id ? 'Edit Article' : 'Create New Article'}
              </h1>
              <p className="font-sans text-sm text-white/40 mt-1">
                Save changes here and the client library will read them from MongoDB.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-[#c79c6e] text-black hover:bg-[#b0885e] rounded text-sm uppercase tracking-widest font-semibold transition-colors shadow-lg shadow-[#c79c6e]/20 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : form.id ? 'Update Article' : 'Upload Article'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <div className="p-6 bg-[#111] border border-white/5 rounded-xl flex flex-col gap-5">
              <h3 className="font-serif text-xl text-[#c79c6e] border-b border-white/5 pb-3">Placement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Select Category</label>
                  <CustomDropdown
                    value={form.categoryId}
                    onChange={handleCategoryChange}
                    options={taxonomyWithCustomHeadings.map((category) => ({
                      value: category.id,
                      label: category.title,
                    }))}
                    placeholder="-- Select a Category --"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Select Chapter</label>
                  <CustomDropdown
                    value={form.headingId}
                    onChange={(value) => handleFormChange('headingId', value)}
                    options={(selectedCategory?.headings || []).map((heading) => ({
                      value: heading.id,
                      label: heading.title,
                    }))}
                    placeholder="-- Select a Chapter --"
                    disabled={!form.categoryId}
                    actionLabel="Add New Chapter"
                    onAction={handleAddChapter}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Article Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleFormChange('title', event.target.value)}
                  placeholder="e.g. Navigating conflict with a partner"
                  className="bg-[#111] border border-white/10 rounded-lg px-5 py-4 text-white text-xl font-serif focus:border-[#c79c6e]/50 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest flex justify-between">
                  <span>Short Description</span>
                  <span className="text-white/30 font-normal normal-case tracking-normal">
                    {form.description.length}/200
                  </span>
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  maxLength={200}
                  onChange={(event) => handleFormChange('description', event.target.value)}
                  placeholder="A brief summary that appears on the article card..."
                  className="bg-[#111] border border-white/10 rounded-lg px-5 py-4 text-white text-sm focus:border-[#c79c6e]/50 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Publishing Status</label>
                <CustomDropdown
                  value={form.status}
                  onChange={(value) => handleFormChange('status', value)}
                  options={[
                    { value: 'Published', label: 'Published (Live)' },
                    { value: 'Draft', label: 'Draft (Hidden)' },
                  ]}
                  placeholder="-- Select Status --"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Featured Image</label>
                <label className="border-2 border-dashed border-white/10 hover:border-[#c79c6e]/50 transition-colors rounded-xl min-h-64 bg-[#111] flex flex-col items-center justify-center cursor-pointer group overflow-hidden">
                  {form.featuredImage ? (
                    <img src={form.featuredImage} alt={form.title || 'Article'} className="w-full h-64 object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-white/20 group-hover:text-[#c79c6e] mb-4 transition-colors" />
                      <span className="text-base font-medium text-white/70">Click to choose a featured image</span>
                      <span className="text-sm text-white/30 mt-1">Saved directly with the article record</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
                {form.featuredImage && (
                  <button
                    type="button"
                    onClick={() => handleFormChange('featuredImage', '')}
                    className="text-left text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Remove image
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Article Body</label>
                <TiptapArticleEditor
                  value={form.bodyHtml}
                  onChange={(value) => handleFormChange('bodyHtml', value)}
                />
              </div>

              {message && (
                <div className={`p-4 rounded-lg border text-sm font-medium ${message.toLowerCase().includes('success') || message.toLowerCase().includes('uploaded') || message.toLowerCase().includes('updated') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {message}
                </div>
              )}

              {form.id && (
                <div className="mt-8 pt-8 border-t border-red-500/10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded text-sm uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash size={16} /> Delete Article
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500 font-sans">
      
      <AdminBreadcrumb items={['LIBRARY', 'CONTENT']} />

      <AdminCardPills 
        title="Content Library" 
        icon={<FolderOpen size={24} />}
        pills={[
          { id: 'collections', label: 'Collections' },
          { id: 'articles', label: 'Articles' },
          { id: 'videos', label: 'Videos' }
        ]}
        activePill={activeTab}
        onPillClick={setActiveTab}
      />

      <div className="mt-4 flex-1 flex flex-col overflow-hidden">
        {activeTab === 'collections' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl animate-in fade-in duration-300">
            <CollectionManager />
          </div>
        ) : activeTab === 'videos' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl animate-in fade-in duration-300">
            <VideoManager />
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative animate-in fade-in duration-300">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <h2 className="font-serif text-2xl text-white hidden md:block">Articles</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group hidden lg:block">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search content..."
              className="bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors w-64"
            />
          </div>

          <button
            type="button"
            onClick={createNewArticle}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-xs uppercase tracking-widest font-semibold transition-colors shadow-lg shadow-[#c79c6e]/10"
          >
            <Plus size={16} /> Create Article
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium shrink-0 ${message.toLowerCase().includes('success') || message.toLowerCase().includes('uploaded') || message.toLowerCase().includes('updated') || message.toLowerCase().includes('deleted') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden min-h-0 mt-2">
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar lg:pr-6 lg:border-r border-white/5">
          <div className="flex items-center justify-between sticky top-0 bg-[#050505] py-2 z-10 border-b border-white/5 mb-2">
            <h2 className="font-sans text-sm font-semibold text-white/70 uppercase tracking-widest">Categories</h2>
          </div>

          <div className="flex flex-col gap-3 pb-6">
            {categories.map((category) => {
              const isActive = category.id === activeCategoryId;
              const { headingsCount, articlesCount } = getCategoryStats(category);
              const Icon = ICON_MAP[category.icon] || Heart;

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`w-full text-left flex items-center gap-4 p-5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#c79c6e]/10 border-[#c79c6e]/40 text-[#c79c6e] shadow-lg shadow-[#c79c6e]/5'
                      : 'bg-[#111] border-white/5 text-white/70 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <Icon size={28} weight={isActive ? 'regular' : 'light'} className={isActive ? 'text-[#c79c6e]' : 'text-white/40'} />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <span className={`font-serif text-xl font-medium truncate ${isActive ? 'text-white' : 'text-white/90'}`}>
                      {category.title}
                    </span>
                    <span className="font-sans text-[0.7rem] uppercase tracking-wider text-white/40 mt-1">
                      {headingsCount} Headings · {articlesCount} Articles
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-white/30 text-sm">Loading articles...</div>
          ) : filteredActiveCategory ? (
            <div className="flex flex-col gap-6 pb-20 max-w-5xl">
              <div className="flex items-center justify-between sticky top-0 bg-[#050505]/95 backdrop-blur-sm py-4 z-20 border-b border-white/5 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#c79c6e]/10 flex items-center justify-center border border-[#c79c6e]/20">
                    {React.createElement(ICON_MAP[filteredActiveCategory.icon] || Heart, {
                      size: 24,
                      className: 'text-[#c79c6e]',
                      weight: 'light',
                    })}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-serif text-3xl text-white">{filteredActiveCategory.title}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-sans text-xs uppercase tracking-widest text-white/40 block">Category Totals</span>
                  <span className="font-sans text-sm text-white/70 mt-1 block">
                    {getCategoryStats(filteredActiveCategory).headingsCount} Headings · {getCategoryStats(filteredActiveCategory).articlesCount} Articles
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-sans text-sm font-semibold text-white/70 uppercase tracking-widest">Chapters & Content</h3>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {filteredActiveCategory.headings.map((heading, index) => {
                    const isExpanded = expandedHeadingId === heading.id;

                    return (
                      <div key={heading.id} className="flex flex-col gap-2">
                        <div
                          className={`flex items-center justify-between p-5 rounded-xl border transition-all cursor-pointer ${
                            isExpanded ? 'bg-[#1a1a1a] border-white/10' : 'bg-[#111] border-white/5 hover:bg-white/5 hover:border-white/10'
                          }`}
                          onClick={() => toggleHeadingExpand(heading.id)}
                        >
                          <div className="flex items-center gap-5">
                            <span className="font-serif text-2xl text-white/20 italic">{index + 1}</span>
                            <div className="flex flex-col">
                              <span className="font-serif text-xl text-white">{heading.title}</span>
                              <span className="font-sans text-[0.7rem] uppercase tracking-wider text-white/40 mt-1">
                                {heading.articles.length} Articles
                              </span>
                            </div>
                          </div>

                          <button type="button" className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white rounded-full hover:bg-white/5">
                            {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="ml-8 pl-6 border-l-2 border-white/5 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                            {heading.articles.length === 0 && (
                              <div className="p-6 border border-dashed border-white/10 rounded-xl text-center flex flex-col items-center gap-2 text-white/30">
                                <span className="text-sm">No articles in this chapter yet.</span>
                              </div>
                            )}

                            {heading.articles.map((article) => (
                              <div
                                key={article._id}
                                onClick={() => openArticleEditor(article)}
                                className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-white/5 hover:border-[#c79c6e]/30 hover:bg-[#111] transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-4">
                                  <DragIcon size={20} className="text-white/10 group-hover:text-white/40 transition-colors" />
                                  <div className="flex flex-col">
                                    <span className="font-serif text-lg text-white/90 group-hover:text-white transition-colors">{article.title}</span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                      <span className={`font-sans text-[0.65rem] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${article.status === 'Published' ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-[#c79c6e] border-[#c79c6e]/20 bg-[#c79c6e]/5'}`}>
                                        {article.status}
                                      </span>
                                      <span className="text-white/20 text-[0.65rem]">•</span>
                                      <span className="font-sans text-[0.7rem] text-white/40">{article.readTime || 'Read time not set'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button type="button" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2">
                                    <Pen size={14} /> Edit
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
              Select a category to view its contents.
            </div>
          )}
        </div>
      </div>
      </div>
      )}
      </div>
    </div>
  );  
}
