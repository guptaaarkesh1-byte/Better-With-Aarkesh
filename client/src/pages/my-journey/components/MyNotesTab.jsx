import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKey, MagnifyingGlass, CaretDown, Plus } from '@phosphor-icons/react';
import NoteEditorSidebar from './NoteEditorSidebar';
import NoteViewModal from './NoteViewModal';

export default function MyNotesTab() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [noteToView, setNoteToView] = useState(null);

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
        setNotes(data.slice(0, 4));
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

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `Created ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  const openEditor = (note = null) => {
    setNoteToEdit(note);
    setIsEditorOpen(true);
  };

  const openView = (note) => {
    setNoteToView(note);
    setIsViewOpen(true);
  };

  return (
    <>
    <div className="w-full h-full rounded-2xl border border-[#c79c6e]/40 bg-[#080808] p-4 sm:p-6 md:p-8 flex flex-col animate-in fade-in duration-700 mb-20 relative overflow-hidden group/notes hover:border-[#c79c6e]/60 transition-colors duration-500 hover:shadow-[0_0_50px_rgba(199,156,110,0.15)]">
      
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c79c6e]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 md:mb-8 relative z-10">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-1">
            My Notes
          </h2>
          <p className="font-sans text-white/70 text-sm sm:text-base font-light">
            A place for the thoughts you want to keep entirely your own.
          </p>
          <div className="flex items-center gap-2 mt-2 sm:mt-4">
            <LockKey size={16} weight="regular" className="text-[#c79c6e]" />
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-[#c79c6e]">
              ONLY VISIBLE TO YOU
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => openEditor()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors shrink-0 border border-transparent"
        >
          <Plus size={18} weight="bold" />
          <span>CREATE A NOTE</span>
        </button>
      </div>

      {/* Toolbar Area */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-6 relative z-10">
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search your notes"
            className="w-full bg-[#0c0c0c] border border-white/10 rounded-lg py-3 pl-11 pr-4 text-xs sm:text-sm font-sans text-white placeholder-white/40 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid of notes (2 columns on md+, 4 max displayed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]">
            <span className="font-sans text-white/40 text-sm tracking-wide">Loading...</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]">
            <span className="font-sans text-white/40 text-sm tracking-wide">No notes found.</span>
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note._id} 
              className="w-full rounded-xl sm:rounded-2xl border border-white/5 bg-[#0c0c0c] hover:bg-[#121212] hover:border-[#c79c6e]/30 transition-all duration-300 p-4 sm:p-5 md:p-6 flex flex-col group overflow-hidden"
            >
              {/* Top Row */}
              <div className="flex flex-col justify-between items-start gap-3 sm:gap-4 w-full h-full">
                {/* Top: Title & Date */}
                <div className="flex flex-col gap-1.5 w-full">
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-white group-hover:text-[#c79c6e] transition-colors leading-tight">
                    {note.title}
                  </h3>
                  <p className="font-sans text-white/40 text-xs sm:text-sm font-light">
                    {formatDate(note.createdAt)}
                  </p>
                </div>

                {/* Middle: Attachment */}
                <div className="flex flex-col gap-1 w-full text-left mt-1">
                  <span className="font-sans text-xs text-white/40">Attached to:</span>
                  <span className="font-sans text-xs sm:text-sm text-white/90 max-w-full sm:max-w-[240px] leading-relaxed truncate">
                    {note.attachedTo || 'Standalone note'}
                  </span>
                </div>

                {/* Bottom: Action buttons directly accessible on mobile and expanded on desktop */}
                <div className="w-full flex items-center gap-3 pt-3 mt-1 border-t border-white/5">
                  <button 
                    onClick={() => openView(note)}
                    className="flex-1 py-2.5 sm:py-3 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/80 hover:text-white font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors text-center"
                  >
                    OPEN
                  </button>
                  <button 
                    onClick={() => openEditor(note)}
                    className="flex-1 py-2.5 sm:py-3 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/80 hover:text-white font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors text-center"
                  >
                    EDIT
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* View All */}
      <div className="flex justify-center mt-4 sm:mt-6 relative z-10">
        <button 
          onClick={() => navigate('/my-journey/notes')}
          className="flex items-center gap-2 font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#c79c6e] hover:text-white transition-colors"
        >
          <span>VIEW ALL NOTES</span>
          <span>&rarr;</span>
        </button>
      </div>

    </div>
    
    <NoteEditorSidebar 
      isOpen={isEditorOpen}
      onClose={() => setIsEditorOpen(false)}
      noteToEdit={noteToEdit}
      onSuccess={fetchNotes}
    />

    <NoteViewModal 
      isOpen={isViewOpen}
      onClose={() => setIsViewOpen(false)}
      note={noteToView}
    />
    </>
  );
}
