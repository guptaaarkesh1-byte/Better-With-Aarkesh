import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { CaretLeft, Plus, LockKey, MagnifyingGlass, CaretDown, X, Trash } from '@phosphor-icons/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import NoteEditorSidebar from './components/NoteEditorSidebar';

import NoteViewModal from './components/NoteViewModal';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'bullet' }, { 'list': 'ordered' }],
    ['clean']
  ]
};

export default function Notes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [noteToView, setNoteToView] = useState(null);

  // Check if we should open editor on load
  useEffect(() => {
    if (location.state?.openEditor) {
      if (location.state.noteToEdit) {
        handleOpenEditor(location.state.noteToEdit);
      } else {
        handleOpenEditor();
      }
      
      // Clear the state properly using React Router
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Prevent scroll when modal open
  useEffect(() => {
    if (isEditorOpen || isViewOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isEditorOpen, isViewOpen]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleOpenEditor = (note = null) => {
    setNoteToEdit(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setNoteToEdit(null);
  };

  const handleOpenView = (note) => {
    setNoteToView(note);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setNoteToView(null);
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchNotes();
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `Created ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };



  return (
    <div className="w-full min-h-screen bg-[#f5f1e8] text-[#111010] relative font-sans overflow-x-hidden pt-28 sm:pt-36 pb-16 sm:pb-24">
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-6 md:gap-8">
        
        {/* Header */}
        <div className="w-full flex flex-col">
          <button 
            onClick={() => navigate('/my-journey', { state: { activeTab: 'MY NOTES' } })}
            className="flex items-center gap-2 text-[#7a756b] hover:text-[#802673] font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold transition-colors mb-6 md:mb-8 w-fit cursor-pointer"
          >
            <CaretLeft size={14} weight="bold" /> BACK
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 md:mb-8">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111010] tracking-tight leading-[1.15] mb-1 sm:mb-2 font-medium">
                All Notes
              </h1>
              <p className="font-sans text-[#555047] text-sm sm:text-base tracking-wide font-light">
                All your private thoughts and reflections in one place.
              </p>
            </div>
            
            <button 
              onClick={() => handleOpenEditor()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl bg-[#802673] text-white hover:bg-[#962e87] font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold transition-all shrink-0 shadow-md cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              <span>CREATE NEW</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a756b]" />
            <input 
              type="text" 
              placeholder="Search your notes"
              className="w-full bg-white border border-black/10 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm font-sans text-[#111010] placeholder-[#7a756b]/40 focus:outline-none focus:border-[#802673] transition-all shadow-2xs"
            />
          </div>
          
          <button className="self-end sm:self-auto flex items-center gap-2 text-[#7a756b] hover:text-[#111010] transition-colors font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold shrink-0 cursor-pointer">
            <span>SORT: NEWEST</span>
            <CaretDown size={14} />
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-black/10 rounded-2xl bg-white shadow-xs">
              <span className="font-sans text-[#7a756b] text-sm tracking-wide">Loading notes...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-black/10 rounded-2xl bg-white shadow-xs">
              <span className="font-sans text-[#7a756b] text-sm tracking-wide">No notes found. Create your first one.</span>
            </div>
          ) : (
            notes.map((note) => (
              <div 
                key={note._id} 
                className="w-full rounded-2xl border border-black/10 bg-white hover:border-[#802673]/40 hover:shadow-md transition-all duration-300 p-5 sm:p-6 flex flex-col group overflow-hidden shadow-xs"
              >
                <div className="flex flex-col justify-between items-start gap-4 w-full h-full">
                  <div className="flex flex-col gap-1.5 w-full">
                    <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-[#111010] group-hover:text-[#802673] transition-colors leading-tight font-medium">
                      {note.title}
                    </h3>
                    <p className="font-sans text-[#7a756b] text-xs sm:text-sm font-light">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 w-full text-left mt-1">
                    <span className="font-sans text-[0.68rem] text-[#7a756b] uppercase tracking-wider font-semibold">Attached to:</span>
                    <span className="font-sans text-xs sm:text-sm text-[#111010] font-medium leading-relaxed truncate">
                      {note.attachedTo || 'Standalone note'}
                    </span>
                  </div>

                  <div className="w-full flex items-center gap-2 sm:gap-3 pt-3 mt-1 border-t border-black/10">
                    <button 
                      onClick={() => handleOpenView(note)} 
                      className="flex-1 py-2 sm:py-2.5 rounded-xl border border-black/15 hover:border-[#802673] hover:bg-[#f6eaf4] text-[#802673] font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.12em] sm:tracking-[0.18em] font-bold transition-all text-center cursor-pointer shadow-2xs"
                    >
                      OPEN
                    </button>
                    <button 
                      onClick={() => handleOpenEditor(note)} 
                      className="flex-1 py-2 sm:py-2.5 rounded-xl border border-black/15 hover:border-[#802673] hover:bg-[#f6eaf4] text-[#802673] font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.12em] sm:tracking-[0.18em] font-bold transition-all text-center cursor-pointer shadow-2xs"
                    >
                      EDIT
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note._id)}
                      className="flex-1 py-2 sm:py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.12em] sm:tracking-[0.18em] font-bold transition-all text-center cursor-pointer"
                    >
                      DELETE
                    </button>
                  </div>

                </div>

              </div>
            ))
          )}
        </div>

      </div>

      <NoteEditorSidebar 
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        noteToEdit={noteToEdit}
        onSuccess={fetchNotes}
      />
      
      <NoteViewModal 
        isOpen={isViewOpen}
        onClose={handleCloseView}
        note={noteToView}
      />

    </div>
  );
}
