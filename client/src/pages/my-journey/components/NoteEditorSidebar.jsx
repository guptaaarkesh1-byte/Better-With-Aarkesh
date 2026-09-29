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
      <div className="relative w-full md:w-[600px] lg:w-[800px] h-full bg-[#f5f1e8] text-[#111010] border-l border-black/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 md:px-10 border-b border-black/10 shrink-0 bg-[#ede7d8]">
          <div className="flex items-center gap-2 text-[#c9542f] font-sans text-[0.65rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">
            <LockKey size={15} weight="bold" />
            <span>{noteToEdit ? 'EDIT PRIVATE NOTE' : 'CREATE PRIVATE NOTE'}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-[#7a756b] hover:text-[#111010] transition-colors p-1.5 sm:p-2 cursor-pointer"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Editor Area */}
        <div className="flex-1 w-full p-4 sm:p-6 md:p-10 flex flex-col gap-4 sm:gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="flex flex-col gap-1">
            <input 
              type="text" 
              placeholder="Note Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent font-serif text-2xl sm:text-3xl md:text-4xl text-[#111010] placeholder-[#7a756b]/40 border-none focus:outline-none transition-colors font-medium"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2 mb-1 sm:mb-2">
            <input 
              type="text" 
              placeholder="Attached to (e.g. Standalone note, Coaching Session)"
              value={formData.attachedTo}
              onChange={(e) => setFormData({ ...formData, attachedTo: e.target.value })}
              className="w-full bg-transparent font-sans text-xs sm:text-sm md:text-base text-[#555047] placeholder-[#7a756b]/40 border-none focus:outline-none transition-colors"
            />
          </div>

          <div className="flex-1 flex flex-col relative h-full min-h-[300px] sm:min-h-[400px] bg-white rounded-2xl border border-black/10 overflow-hidden shadow-xs [&_.ql-toolbar]:!border-none [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-black/10 [&_.ql-container]:!border-none [&_.ql-editor]:!font-serif [&_.ql-editor]:!text-base sm:[&_.ql-editor]:!text-lg [&_.ql-editor]:!text-[#111010] [&_.ql-editor.ql-blank::before]:!text-[#7a756b]/40">
            <ReactQuill 
              theme="snow"
              modules={quillModules}
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Start writing..."
              className="absolute inset-0 flex flex-col"
            />
            <div className="absolute bottom-4 right-4 text-xs font-sans text-[#7a756b] pointer-events-none z-10">
              {formData.content ? formData.content.replace(/<[^>]*>?/gm, ' ').trim().split(/\s+/).filter(Boolean).length : 0} words
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 md:px-10 border-t border-black/10 shrink-0 flex flex-wrap sm:flex-nowrap justify-end gap-2 sm:gap-4 bg-[#ede7d8]">
          {noteToEdit && (
            <button 
              onClick={handleDeleteNote}
              className="mr-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-red-500/30 text-red-600 hover:bg-red-50 font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-colors cursor-pointer"
            >
              <Trash size={15} className="inline mr-1.5 -mt-0.5" /> DELETE
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl border border-black/15 text-[#555047] hover:text-[#111010] hover:bg-black/5 font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-colors cursor-pointer shadow-2xs"
          >
            CANCEL
          </button>
          <button 
            onClick={handleSaveNote}
            disabled={!formData.title.trim() || isSaving}
            className="px-6 sm:px-10 py-2.5 sm:py-3 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-white disabled:opacity-50 disabled:cursor-not-allowed font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all shadow-md cursor-pointer"
          >
            {isSaving ? 'SAVING...' : 'SAVE NOTE'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
