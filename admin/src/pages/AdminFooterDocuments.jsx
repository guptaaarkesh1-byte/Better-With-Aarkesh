import React, { useState, useEffect } from 'react';
import { Plus, Trash, Pen, FloppyDisk, X } from '@phosphor-icons/react';
import TiptapEditor from '../components/ui/TiptapEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emptyForm = {
  id: null,
  title: '',
  slug: '',
  contentHtml: '',
  status: 'Draft',
  order: 0,
};

export default function AdminFooterDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to fetch footer documents:', err);
    }
  };

  const handleAddNew = () => {
    setFormData(emptyForm);
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (doc) => {
    setFormData({
      id: doc._id,
      title: doc.title,
      slug: doc.slug,
      contentHtml: doc.contentHtml,
      status: doc.status,
      order: doc.order,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      // Auto-generate slug if empty
      const payload = { ...formData };
      if (!payload.slug && payload.title) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      const url = payload.id 
        ? `${API_URL}/api/footer-documents/${payload.id}`
        : `${API_URL}/api/footer-documents`;
        
      const method = payload.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIsEditing(false);
        fetchDocuments();
      } else {
        setError(data.message || 'Failed to save document');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('An error occurred while saving.');
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#050505] p-6 text-white min-h-0 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-white">Footer</h1>
            <p className="text-white/50 text-sm mt-1">Manage pages linked in the website footer (e.g., Privacy Policy)</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#c79c6e] text-black font-semibold rounded-md hover:bg-[#c79c6e]/90 transition-colors text-sm"
            >
              <Plus size={16} weight="bold" />
              Add Document
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-medium">{formData.id ? 'Edit Document' : 'New Document'}</h2>
              <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#c79c6e] outline-none"
                  placeholder="e.g. Privacy Policy"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Slug (Auto-generated if empty)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#c79c6e] outline-none"
                  placeholder="e.g. privacy-policy"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#c79c6e] outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Order (Lower numbers appear first)</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#c79c6e] outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider">Content</label>
              <TiptapEditor
                value={formData.contentHtml}
                onChange={(value) => setFormData({ ...formData, contentHtml: value })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-md border border-white/10 hover:bg-white/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-[#c79c6e] text-black font-semibold rounded-md hover:bg-[#c79c6e]/90 transition-colors text-sm"
              >
                <FloppyDisk size={18} />
                Save Document
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-white/50">
                No footer pages found. Click "Add Document" to create one.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#111]">
                    <th className="p-4 text-xs font-sans uppercase tracking-widest text-white/50 font-normal">Order</th>
                    <th className="p-4 text-xs font-sans uppercase tracking-widest text-white/50 font-normal">Title</th>
                    <th className="p-4 text-xs font-sans uppercase tracking-widest text-white/50 font-normal">Slug</th>
                    <th className="p-4 text-xs font-sans uppercase tracking-widest text-white/50 font-normal">Status</th>
                    <th className="p-4 text-xs font-sans uppercase tracking-widest text-white/50 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-sm">{doc.order}</td>
                      <td className="p-4 text-sm font-medium">{doc.title}</td>
                      <td className="p-4 text-sm text-white/50">/{doc.slug}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${doc.status === 'Published' ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/60'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pen size={16} />
                        </button>
                        {doc.slug !== 'privacy-policy' && doc.slug !== 'terms-and-conditions' && doc.slug !== 'terms-of-service' && doc.slug !== 'rescheduling-policy' && (
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="w-8 h-8 rounded bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
