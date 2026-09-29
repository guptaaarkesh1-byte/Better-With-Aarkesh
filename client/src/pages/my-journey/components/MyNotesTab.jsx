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
    <div className="w-full h-full rounded-2xl border border-black/10 bg-[#f5f1e8] p-4 sm:p-6 md:p-8 flex flex-col mb-20 relative overflow-hidden shadow-xs">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 md:mb-8 relative z-10">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#111010] mb-1">
            My Notes
          </h2>
          <p className="font-sans text-[#555047] text-sm sm:text-base font-light">
            A place for the thoughts you want to keep entirely your own.
          </p>
          <div className="flex items-center gap-2 mt-2 sm:mt-4">
            <LockKey size={16} weight="bold" className="text-[#c9542f]" />
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#c9542f]">
              ONLY VISIBLE TO YOU
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => openEditor()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-[#c9542f] text-white hover:bg-[#a64117] font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold transition-all shrink-0 shadow-md cursor-pointer"
        >
          <Plus size={18} weight="bold" />
          <span>CREATE A NOTE</span>
        </button>
      </div>

      {/* Toolbar Area */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-6 relative z-10">
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a756b]" />
          <input 
            type="text" 
            placeholder="Search your notes"
            className="w-full bg-white border border-black/10 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm font-sans text-[#111010] placeholder-[#7a756b]/40 focus:outline-none focus:border-[#c9542f] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of notes (2 columns on md+, 4 max displayed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-black/10 rounded-2xl bg-white shadow-xs">
            <span className="font-sans text-[#7a756b] text-sm tracking-wide">Loading...</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-black/10 rounded-2xl bg-white shadow-xs">
            <span className="font-sans text-[#7a756b] text-sm tracking-wide">No notes found.</span>
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note._id} 
              className="w-full rounded-xl sm:rounded-2xl border border-black/10 bg-white hover:border-[#c9542f]/40 hover:shadow-md transition-all duration-300 p-4 sm:p-5 md:p-6 flex flex-col group overflow-hidden shadow-xs"
            >
              {/* Top Row */}
              <div className="flex flex-col justify-between items-start gap-3 sm:gap-4 w-full h-full">
                {/* Top: Title & Date */}
                <div className="flex flex-col gap-1.5 w-full">
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-[#111010] group-hover:text-[#c9542f] transition-colors leading-tight">
                    {note.title}
                  </h3>
                  <p className="font-sans text-[#7a756b] text-xs sm:text-sm font-light">
                    {formatDate(note.createdAt)}
                  </p>
                </div>

                {/* Middle: Attachment */}
                <div className="flex flex-col gap-1 w-full text-left mt-1">
                  <span className="font-sans text-xs text-[#7a756b]">Attached to:</span>
                  <span className="font-sans text-xs sm:text-sm text-[#111010] font-medium max-w-full sm:max-w-[240px] leading-relaxed truncate">
                    {note.attachedTo || 'Standalone note'}
                  </span>
                </div>

                {/* Bottom: Action buttons directly accessible on mobile and expanded on desktop */}
                <div className="w-full flex items-center gap-3 pt-3 mt-1 border-t border-black/10">
                  <button 
                    onClick={() => openView(note)}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl border border-black/15 hover:border-[#c9542f] hover:bg-[#fbf0eb] text-[#c9542f] font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold transition-all text-center cursor-pointer shadow-2xs"
                  >
                    OPEN
                  </button>
                  <button 
                    onClick={() => openEditor(note)}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl border border-black/15 hover:border-[#c9542f] hover:bg-[#fbf0eb] text-[#c9542f] font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold transition-all text-center cursor-pointer shadow-2xs"
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
          className="flex items-center gap-2 font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-bold text-[#c9542f] hover:text-[#a64117] transition-colors cursor-pointer"
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
