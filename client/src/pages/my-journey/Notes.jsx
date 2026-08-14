import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { CaretLeft, Plus, LockKey, MagnifyingGlass, CaretDown, X, Trash } from '@phosphor-icons/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import bgImage from '../../assets/images/my-journey-bg.png';
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
    <div className="w-full min-h-screen bg-[#050505] text-white select-none relative font-sans overflow-x-hidden pt-32 pb-24">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bgImage} 
          alt="Dark Background" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="w-full flex flex-col">
          <button 
            onClick={() => navigate('/my-journey', { state: { activeTab: 'MY NOTES' } })}
            className="flex items-center gap-2 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors mb-8 w-fit"
          >
            <CaretLeft size={14} weight="bold" /> BACK
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-serif text-3xl md:text-5xl text-white tracking-tight leading-[1.1] mb-2">
                All Notes
              </h1>
              <p className="font-sans text-white/60 text-sm tracking-wide">
                All your private thoughts and reflections in one place.
              </p>
            </div>
            
            <button 
              onClick={() => handleOpenEditor()}
              className="flex items-center gap-2 px-6 py-4 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-colors shrink-0 border border-transparent"
            >
              <Plus size={16} weight="bold" />
              <span>CREATE NEW</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search your notes"
              className="w-full bg-[#0a0a0a]/40 backdrop-blur-md border border-white/10 rounded-lg py-3.5 pl-12 pr-4 text-sm font-sans text-white placeholder-white/40 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
            />
          </div>
          
          <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium shrink-0">
            <span>SORT: NEWEST</span>
            <CaretDown size={14} />
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]/40 backdrop-blur-sm">
              <span className="font-sans text-white/40 text-sm tracking-wide">Loading notes...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]/40 backdrop-blur-sm">
              <span className="font-sans text-white/40 text-sm tracking-wide">No notes found. Create your first one.</span>
            </div>
          ) : (
            notes.map((note) => (
              <div 
                key={note._id} 
                className="w-full rounded-2xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md hover:bg-[#0a0a0a]/70 hover:backdrop-blur-lg hover:border-[#c79c6e]/30 transition-all duration-500 p-6 flex flex-col group overflow-hidden"
              >
                <div className="flex flex-col justify-between items-start gap-4 w-full h-full">
                  <div className="flex flex-col gap-2 w-full">
                    <h3 className="font-serif text-xl md:text-2xl text-white group-hover:text-[#c79c6e] transition-colors leading-tight">
                      {note.title}
                    </h3>
                    <p className="font-sans text-white/40 text-xs md:text-sm font-light">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 w-full text-left mt-2">
                    <span className="font-sans text-[0.7rem] text-white/40">Attached to:</span>
                    <span className="font-sans text-sm text-white/90 leading-relaxed">
                      {note.attachedTo || 'Standalone note'}
                    </span>
                  </div>

                  <div className="shrink-0 mt-4 w-full flex justify-start opacity-100 group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-300">
                    <button onClick={() => handleOpenView(note)} className="px-8 py-3 rounded border border-white/20 text-white/60 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium hover:border-[#c79c6e]/40 hover:text-[#c79c6e]">
                      OPEN
                    </button>
                  </div>
                </div>

                {/* Expandable Action Row */}
                <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden flex flex-col xl:flex-row gap-4 pt-4 mt-3 border-t border-white/5 group-hover:border-[#c79c6e]/20">
                    <button 
                      onClick={() => handleOpenView(note)} 
                      className="flex-1 py-3 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
                    >
                      OPEN
                    </button>
                    <button 
                      onClick={() => handleOpenEditor(note)} 
                      className="flex-1 py-3 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
                    >
                      EDIT
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note._id)}
                      className="flex-1 py-3 rounded border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 text-red-400 hover:text-red-300 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
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
