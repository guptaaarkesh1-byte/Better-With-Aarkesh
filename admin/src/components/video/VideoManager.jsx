import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash, 
  Pen, 
  ArrowLeft,
  VideoCamera,
  MagnifyingGlass,
  Image as ImageIcon
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emptyForm = {
  id: null,
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  duration: '10 MIN',
  status: 'Draft',
};

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/videos`);
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load videos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const createNewVideo = () => {
    setForm(emptyForm);
    setIsEditing(true);
    setMessage('');
  };

  const editVideo = (video) => {
    setForm({
      id: video._id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      status: video.status,
    });
    setIsEditing(true);
    setMessage('');
  };

  const closeEditor = () => {
    setIsEditing(false);
    setForm(emptyForm);
    setMessage('');
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, thumbnailUrl: typeof reader.result === 'string' ? reader.result : '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = form.id ? `${API_URL}/api/videos/${form.id}` : `${API_URL}/api/videos`;
      const method = form.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          videoUrl: form.videoUrl,
          thumbnailUrl: form.thumbnailUrl,
          duration: form.duration,
          status: form.status,
        })
      });

      if (!res.ok) throw new Error('Failed to save video');
      
      const savedVideo = await res.json();
      
      setVideos(current => {
        if (form.id) {
          return current.map(v => v._id === savedVideo._id ? savedVideo : v);
        }
        return [savedVideo, ...current];
      });

      setMessage(`Video ${form.id ? 'updated' : 'created'} successfully!`);
      closeEditor();
    } catch (err) {
      console.error(err);
      setMessage('Failed to save video.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id || !window.confirm('Are you sure you want to delete this video?')) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/videos/${form.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete video');
      
      setVideos(current => current.filter(v => v._id !== form.id));
      setMessage('Video deleted successfully.');
      closeEditor();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete video.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isEditing) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-4xl">
        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
          <button
            type="button"
            onClick={closeEditor}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] border border-white/10 text-white/50 hover:text-white hover:border-[#c79c6e]/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-3xl text-white">
              {form.id ? 'Edit Video' : 'Create New Video'}
            </h1>
            <p className="font-sans text-sm text-white/40 mt-1">
              Add video details and YouTube/Instagram URLs here.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Title</label>
              <input
                required
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="E.g., When clarity asks something of you"
                className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c79c6e]/50 transition-colors appearance-none"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Description</label>
            <textarea
              required
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Brief description of the video..."
              rows={3}
              className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Video URL (YouTube/Instagram)</label>
              <input
                required
                type="text"
                name="videoUrl"
                value={form.videoUrl}
                onChange={handleFormChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Duration (e.g. "8 MIN")</label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleFormChange}
                placeholder="10 MIN"
                className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Thumbnail Image (URL or Upload)</label>
            <div className="flex gap-4">
              <input
                required
                type="text"
                name="thumbnailUrl"
                value={form.thumbnailUrl}
                onChange={handleFormChange}
                placeholder="https://example.com/image.jpg"
                className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors flex-1"
              />
              <label className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#c79c6e]/30 cursor-pointer transition-all shrink-0">
                <ImageIcon size={20} className="text-white/60" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>
            </div>
            {form.thumbnailUrl && (
              <div className="mt-2 w-full max-w-[320px] aspect-video rounded border border-white/10 overflow-hidden bg-black relative">
                <img src={form.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play size={32} weight="light" className="text-white/60" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Description</label>
            <textarea
              required
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={4}
              placeholder="A brief description of this video..."
              className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Video'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded text-sm uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash size={16} /> Delete
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl text-white">Video Library</h2>
          <p className="font-sans text-sm text-white/50">Manage the video content displayed on the client platform.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group hidden lg:block">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors w-64"
            />
          </div>
          <button
            type="button"
            onClick={createNewVideo}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-xs uppercase tracking-widest font-semibold transition-colors shadow-lg shadow-[#c79c6e]/10"
          >
            <Plus size={16} /> Add Video
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium shrink-0 ${message.toLowerCase().includes('fail') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-white/40 py-12">Loading videos...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="col-span-full text-center text-white/40 py-12 border border-dashed border-white/10 rounded-xl bg-[#0a0a0a]">
            No videos found. Create one to get started.
          </div>
        ) : (
          filteredVideos.map(video => (
            <div 
              key={video._id} 
              onClick={() => editVideo(video)}
              className="group cursor-pointer bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden hover:border-[#c79c6e]/50 transition-all duration-300 flex flex-col"
            >
              <div className="w-full aspect-[16/10] bg-[#111] relative overflow-hidden">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] transition-colors" />
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[0.6rem] font-sans font-bold tracking-widest text-[#c79c6e]">
                  {video.duration}
                </div>
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-serif text-lg text-white/90 group-hover:text-white line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <button type="button" className="text-white/20 hover:text-white transition-colors shrink-0">
                    <Pen size={16} />
                  </button>
                </div>
                <span className={`text-[0.65rem] font-semibold uppercase tracking-widest w-max px-2 py-0.5 rounded border mt-auto ${video.status === 'Published' ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-[#c79c6e] border-[#c79c6e]/20 bg-[#c79c6e]/5'}`}>
                  {video.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
