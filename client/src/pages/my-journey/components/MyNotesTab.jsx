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
    <div className="w-full h-full rounded-2xl border border-[#c79c6e]/40 bg-[#0a0a0a]/70 backdrop-blur-sm p-6 md:p-8 flex flex-col animate-in fade-in duration-700 mb-20 relative overflow-hidden group/notes hover:border-[#c79c6e]/60 transition-colors duration-500 hover:shadow-[0_0_50px_rgba(199,156,110,0.15)]">
      
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c79c6e]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-2">
            My Notes
          </h2>
          <p className="font-sans text-white/70 text-base font-light">
            A place for the thoughts you want to keep entirely your own.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <LockKey size={14} weight="regular" className="text-[#c79c6e]" />
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">
              ONLY VISIBLE TO YOU
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-6 py-4 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-colors shrink-0 border border-transparent"
        >
          <Plus size={16} weight="bold" />
          <span>CREATE A NOTE</span>
        </button>
      </div>

      {/* Toolbar Area */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 relative z-10">
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

      {/* Notes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 relative z-10">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]/40 backdrop-blur-sm">
            <span className="font-sans text-white/40 text-sm tracking-wide">Loading...</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]/40 backdrop-blur-sm">
            <span className="font-sans text-white/40 text-sm tracking-wide">No notes found.</span>
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note._id} 
              className="w-full rounded-2xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md hover:bg-[#0a0a0a]/70 hover:backdrop-blur-lg hover:border-[#c79c6e]/30 transition-all duration-500 p-5 md:p-6 flex flex-col group overflow-hidden"
            >
              {/* Top Row */}
              <div className="flex flex-col justify-between items-start gap-4 w-full h-full">
                {/* Top: Title & Date */}
                <div className="flex flex-col gap-2 w-full">
                  <h3 className="font-serif text-xl md:text-2xl text-white group-hover:text-[#c79c6e] transition-colors leading-tight">
                    {note.title}
                  </h3>
                  <p className="font-sans text-white/40 text-xs md:text-sm font-light">
                    {formatDate(note.createdAt)}
                  </p>
                </div>

                {/* Middle: Attachment */}
                <div className="flex flex-col gap-1 w-full text-left mt-2">
                  <span className="font-sans text-[0.7rem] text-white/40">Attached to:</span>
                  <span className="font-sans text-sm text-white/90 max-w-[240px] leading-relaxed">
                    {note.attachedTo || 'Standalone note'}
                  </span>
                </div>

                {/* Bottom: Default Action (Fades out on hover) */}
                <div className="shrink-0 mt-2 w-full flex justify-start opacity-100 group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-300">
                  <button 
                    onClick={() => openView(note)}
                    className="px-8 py-3 rounded border border-white/20 text-white/60 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium"
                  >
                    OPEN
                  </button>
                </div>
              </div>

              {/* Expandable Action Row */}
              <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                <div className="overflow-hidden flex flex-col md:flex-row gap-4 pt-4 mt-3 border-t border-white/5 group-hover:border-[#c79c6e]/20">
                  <button 
                    onClick={() => openView(note)}
                    className="flex-1 py-4 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
                  >
                    OPEN
                  </button>
                  <button 
                    onClick={() => openEditor(note)}
                    className="flex-1 py-4 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
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
      <div className="flex justify-center mt-6 relative z-10">
        <button 
          onClick={() => navigate('/my-journey/notes')}
          className="flex items-center gap-2 font-sans text-[0.75rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors"
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
