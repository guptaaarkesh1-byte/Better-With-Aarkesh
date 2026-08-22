import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash, 
  Pen, 
  X,
  FloppyDisk,
  WarningCircle,
  VideoCamera,
  Article,
  Cards
} from '@phosphor-icons/react';
import { articleTaxonomy } from '../../constants/articleTaxonomy';
import CustomSelect from '../ui/CustomSelect';

export default function CollectionManager() {
  const [collections, setCollections] = useState([]);
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Draft');
  
  // We need exactly 3 items
  const initialItems = [
    { itemType: 'Article', itemId: '', title: '' },
    { itemType: 'Video', itemId: '', title: '' },
    { itemType: 'Article', itemId: '', title: '' },
  ];
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const [collectionsRes, articlesRes, videosRes] = await Promise.all([
        fetch(`${apiUrl}/api/collections/admin`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/articles/admin`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/videos`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (collectionsRes.ok && articlesRes.ok && videosRes.ok) {
        setCollections(await collectionsRes.json());
        setArticles(await articlesRes.json());
        setVideos(await videosRes.json());
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      console.error(err);
      setError('Could not load data. Ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentCollection(null);
    setTitle('');
    setStatus('Draft');
    setItems(initialItems);
    setIsEditing(true);
  };

  const handleEdit = (collection) => {
    setCurrentCollection(collection);
    setTitle(collection.title);
    setStatus(collection.status);
    
    // Pad items to 3 if less than 3 exist in db for some reason
    const paddedItems = [...collection.items];
    while(paddedItems.length < 3) {
      paddedItems.push({ itemType: 'Article', itemId: '', title: '' });
    }
    
    // Back-fill categoryId and headingId for articles
    const preparedItems = paddedItems.slice(0, 3).map(item => {
      if (item.itemType === 'Article' && item.itemId) {
        const found = articles.find(a => a._id === item.itemId);
        if (found) {
          return { ...item, categoryId: found.categoryId, headingId: found.headingId };
        }
      }
      return item;
    });

    setItems(preparedItems);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${apiUrl}/api/collections/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setCollections(collections.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete collection');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'itemType') {
      newItems[index] = { itemType: value, itemId: '', title: '', categoryId: '', headingId: '' };
    } else if (field === 'categoryId') {
      newItems[index].categoryId = value;
      newItems[index].headingId = ''; // reset chapter when category changes
      newItems[index].itemId = '';    // reset selected article
      newItems[index].title = '';
    } else if (field === 'headingId') {
      newItems[index].headingId = value;
      newItems[index].itemId = '';    // reset selected article
      newItems[index].title = '';
    } else if (field === 'itemId') {
      newItems[index].itemId = value;
      // Find and set the title automatically
      if (newItems[index].itemType === 'Article') {
        const found = articles.find(a => a._id === value);
        if (found) newItems[index].title = found.title;
      } else if (newItems[index].itemType === 'Video') {
        const found = videos.find(v => v._id === value);
        if (found) newItems[index].title = found.title;
      }
    }
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all 3 items are selected
    if (items.some(item => !item.itemId)) {
      alert('Please select content for all 3 slots in the collection.');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const method = currentCollection ? 'PUT' : 'POST';
      const url = currentCollection 
        ? `${apiUrl}/api/collections/admin/${currentCollection._id}`
        : `${apiUrl}/api/collections/admin`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          status,
          items
        })
      });

      if (res.ok) {
        fetchData();
        setIsEditing(false);
      } else {
        alert('Failed to save collection');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving collection');
    }
  };

  if (loading) return <div className="text-white/50 text-sm">Loading collections...</div>;
  if (error) return <div className="text-red-500 text-sm flex items-center gap-2"><WarningCircle /> {error}</div>;

  return (
    <div className="flex flex-col h-full font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-white flex items-center gap-3">
            <Cards className="text-[#c79c6e]" weight="light" />
            Curated Collections
          </h2>
          <p className="text-sm text-white/40 mt-1">Manage immersive multi-content cards for the frontend.</p>
        </div>
        

      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
            
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-serif text-[#c79c6e]">{currentCollection ? 'Edit Collection' : 'Create New Collection'}</h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Title & Status */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Collection Heading (Card Text)</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#111] border border-white/10 rounded px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]/50"
                    placeholder="e.g. When you know something is wrong..."
                    required
                  />
                </div>
                
                <div className="md:w-48 flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Status</label>
                  <CustomSelect 
                    value={status}
                    onChange={setStatus}
                    placeholder="Select Status"
                    options={[
                      { value: 'Draft', label: 'Draft' },
                      { value: 'Published', label: 'Published' }
                    ]}
                  />
                </div>
              </div>

              {/* Items Selection */}
              <div className="flex flex-col gap-4 mt-6">
                <div>
                  <h4 className="text-sm font-semibold text-white/80 pb-2 border-b border-white/10">Card Contents</h4>
                  <p className="text-xs text-white/40 mt-2">Configure the 3 items that will appear when this collection is clicked.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  {items.map((item, index) => (
                    <div key={index} className="bg-[#111] border border-white/5 hover:border-white/10 transition-colors rounded-xl p-4 md:p-5 flex flex-col gap-4 relative">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#c79c6e]/20 text-[#c79c6e] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-white/80">
                            {index === 0 ? 'First Slot' : index === 1 ? 'Second Slot' : 'Third Slot'}
                          </span>
                        </div>
                        
                        {/* Segmented Control for Type */}
                        <div className="flex bg-[#050505] rounded-lg p-1 border border-white/5">
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'itemType', 'Article')}
                            className={`px-4 py-1 text-xs rounded-md transition-all ${item.itemType === 'Article' ? 'bg-[#c79c6e] text-black font-bold shadow-sm' : 'text-white/50 hover:text-white'}`}
                          >
                            Article
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'itemType', 'Video')}
                            className={`px-4 py-1 text-xs rounded-md transition-all ${item.itemType === 'Video' ? 'bg-[#c79c6e] text-black font-bold shadow-sm' : 'text-white/50 hover:text-white'}`}
                          >
                            Video
                          </button>
                        </div>
                      </div>

                      {/* Selection Area */}
                      <div className="flex flex-col md:flex-row gap-4 pt-1">
                        {item.itemType === 'Article' ? (
                          <>
                            <div className="flex-1 flex flex-col gap-1.5">
                              <label className="text-[0.65rem] uppercase tracking-widest text-white/40">Category</label>
                              <CustomSelect 
                                value={item.categoryId || ''}
                                onChange={(value) => handleItemChange(index, 'categoryId', value)}
                                placeholder="-- All Categories --"
                                options={articleTaxonomy.map(c => ({ value: c.id, label: c.title }))}
                              />
                            </div>

                            <div className="flex-1 flex flex-col gap-1.5">
                              <label className="text-[0.65rem] uppercase tracking-widest text-white/40">Chapter</label>
                              <CustomSelect 
                                value={item.headingId || ''}
                                onChange={(value) => handleItemChange(index, 'headingId', value)}
                                placeholder="-- All Chapters --"
                                disabled={!item.categoryId}
                                options={(articleTaxonomy.find(c => c.id === item.categoryId)?.headings || []).map(h => ({ value: h.id, label: h.title }))}
                              />
                            </div>

                            <div className="flex-[2] flex flex-col gap-1.5">
                              <label className="text-[0.65rem] uppercase tracking-widest text-white/40">Select Article</label>
                              <CustomSelect 
                                value={item.itemId || ''}
                                onChange={(value) => handleItemChange(index, 'itemId', value)}
                                placeholder="-- Choose Article --"
                                required
                                options={articles
                                  .filter(a => (!item.categoryId || a.categoryId === item.categoryId) && (!item.headingId || a.headingId === item.headingId))
                                  .map(a => ({ value: a._id, label: a.title }))}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-[0.65rem] uppercase tracking-widest text-white/40">Select Video</label>
                            <CustomSelect 
                              value={item.itemId || ''}
                              onChange={(value) => handleItemChange(index, 'itemId', value)}
                              placeholder="-- Choose Video --"
                              required
                              options={videos.map(v => ({ value: v._id, label: v.title }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#c79c6e] text-black hover:bg-[#b0885e] rounded text-sm uppercase tracking-widest font-semibold transition-colors"
                >
                  <FloppyDisk size={18} /> Save Collection
                </button>
              </div>

            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {collections.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-white/30 text-sm">
              No collections found. Create your first one!
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {collections.map(collection => (
                <div key={collection._id} className="bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors rounded-xl p-5 flex flex-col gap-4 group">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-lg text-white leading-snug pr-4">{collection.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[0.65rem] uppercase tracking-widest font-bold px-2 py-1 rounded ${
                        collection.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-white/50'
                      }`}>
                        {collection.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {collection.items.map((item, idx) => (
                      <div key={idx} className="flex-1 bg-[#111] border border-white/5 rounded p-2 flex flex-col gap-1 overflow-hidden" title={item.title}>
                        <div className="flex items-center gap-1 text-[#c79c6e] text-xs">
                          {item.itemType === 'Article' ? <Article weight="duotone" /> : <VideoCamera weight="duotone" />}
                          <span className="text-[0.6rem] uppercase font-semibold">{item.itemType}</span>
                        </div>
                        <span className="text-white/60 text-xs truncate">{item.title || 'Unknown'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(collection)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                      <Pen size={16} />
                    </button>
                    <button onClick={() => handleDelete(collection._id)} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
