import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LockKey, X, Trash } from '@phosphor-icons/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'bullet' }, { 'list': 'ordered' }],
    ['clean']
  ]
};

export default function NoteEditorSidebar({ isOpen, onClose, noteToEdit, onSuccess }) {
  const [formData, setFormData] = useState({ title: '', attachedTo: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        setFormData({
          title: noteToEdit.title || '',
          attachedTo: noteToEdit.attachedTo || '',
          content: noteToEdit.content || ''
        });
      } else {
        setFormData({ title: '', attachedTo: '', content: '' });
      }
    }
  }, [isOpen, noteToEdit]);

  const handleSaveNote = async () => {
    if (!formData.title.trim()) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = noteToEdit 
        ? `${import.meta.env.VITE_API_URL}/api/notes/${noteToEdit._id}`
        : `${import.meta.env.VITE_API_URL}/api/notes`;
        
      const method = noteToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        console.error('Failed to save note');
      }
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToEdit) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${noteToEdit._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-end" data-lenis-prevent="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="relative w-full md:w-[600px] lg:w-[800px] h-full bg-[#111111] border-l border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 md:px-10 border-b border-white/5 shrink-0 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 text-[#b18d69] font-sans text-xs uppercase tracking-[0.2em] font-semibold">
            <LockKey size={16} weight="bold" />
            <span>{noteToEdit ? 'EDIT PRIVATE NOTE' : 'CREATE PRIVATE NOTE'}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Editor Area */}
        <div className="flex-1 w-full p-6 md:p-10 flex flex-col gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="flex flex-col gap-1">
            <input 
              type="text" 
              placeholder="Note Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent font-serif text-4xl text-white placeholder-white/60 border-none focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2 mb-2">
            <input 
              type="text" 
              placeholder="Attached to (e.g. Standalone note, Coaching Session)"
              value={formData.attachedTo}
              onChange={(e) => setFormData({ ...formData, attachedTo: e.target.value })}
              className="w-full bg-transparent font-sans text-base text-white placeholder-white/60 border-none focus:outline-none transition-colors"
            />
          </div>

          <div className="flex-1 flex flex-col relative h-full min-h-[400px] [&_.ql-toolbar_.ql-stroke]:!stroke-white [&_.ql-toolbar_.ql-fill]:!fill-white [&_.ql-toolbar_.ql-picker]:!text-white [&_.ql-editor.ql-blank::before]:!text-white/60 [&_.ql-editor.ql-blank::before]:!opacity-100">
            <ReactQuill 
              theme="snow"
              modules={quillModules}
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Start writing..."
              className="absolute inset-0 flex flex-col text-white"
            />
            <div className="absolute bottom-4 right-4 text-xs font-sans text-white/70 pointer-events-none z-10">
              {formData.content ? formData.content.replace(/<[^>]*>?/gm, ' ').trim().split(/\s+/).filter(Boolean).length : 0} words
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 md:px-10 border-t border-white/10 shrink-0 flex justify-end gap-4 bg-[#0a0a0a]">
          {noteToEdit && (
            <button 
              onClick={handleDeleteNote}
              className="mr-auto px-6 py-3 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-semibold transition-colors"
            >
              <Trash size={16} className="inline mr-2 -mt-0.5" /> DELETE
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded border border-white/20 text-white/90 hover:text-white hover:bg-white/10 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-semibold transition-colors"
          >
            CANCEL
          </button>
          <button 
            onClick={handleSaveNote}
            disabled={!formData.title.trim() || isSaving}
            className="px-10 py-3 rounded bg-[#c79c6e] hover:bg-[#d4b08c] text-black disabled:opacity-80 disabled:cursor-not-allowed font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-colors"
          >
            {isSaving ? 'SAVING...' : 'SAVE NOTE'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
