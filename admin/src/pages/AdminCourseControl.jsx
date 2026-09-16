import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Plus, 
  PencilSimple, 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  ArrowClockwise, 
  CircleNotch, 
  SlidersHorizontal, 
  Sparkle, 
  Eye, 
  EyeSlash, 
  X, 
  Info,
  ArrowsClockwise
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminCourseControl() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    isActive: true,
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/cards/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      } else {
        showNotification('Failed to load curriculum cards', 'error');
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
      showNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCard(null);
    setFormData({
      title: '',
      description: '',
      order: cards.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card) => {
    setEditingCard(card);
    setFormData({
      title: card.title || '',
      description: card.description || '',
      order: card.order !== undefined ? card.order : 0,
      isActive: card.isActive !== undefined ? card.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  // Save Card (Create or Update)
  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification('Title and Description are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const url = editingCard
        ? `${API_URL}/api/courses/cards/admin/${editingCard._id}`
        : `${API_URL}/api/courses/cards/admin`;
      const method = editingCard ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showNotification(editingCard ? 'Card updated successfully' : 'New card added successfully');
        handleCloseModal();
        fetchCards();
      } else {
        const errData = await res.json();
        showNotification(errData.message || 'Failed to save card', 'error');
      }
    } catch (err) {
      console.error('Error saving card:', err);
      showNotification('Error saving card', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Card
  const handleDeleteCard = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/cards/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showNotification('Card deleted successfully');
        fetchCards();
      } else {
        showNotification('Failed to delete card', 'error');
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      showNotification('Error deleting card', 'error');
    }
  };

  // Toggle Card Active State
  const handleToggleActive = async (card) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/cards/admin/${card._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !card.isActive })
      });

      if (res.ok) {
        showNotification(`Card ${!card.isActive ? 'activated' : 'deactivated'}`);
        fetchCards();
      }
    } catch (err) {
      console.error('Error toggling card status:', err);
    }
  };

  // Move Card Up / Down
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const updated = [...cards];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-assign order numbers
    setCards(updated);

    try {
      const token = localStorage.getItem('adminToken');
      await Promise.all(
        updated.map((c, i) =>
          fetch(`${API_URL}/api/courses/cards/admin/${c._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ order: i })
          })
        )
      );
      showNotification('Card order updated');
    } catch (err) {
      console.error('Error updating order:', err);
      fetchCards();
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all cards back to the default 8 curriculum items? Any custom cards will be replaced.')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/cards/admin/reset-defaults`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showNotification('Reset to default 8 cards successfully');
        fetchCards();
      } else {
        showNotification('Failed to reset defaults', 'error');
      }
    } catch (err) {
      console.error('Error resetting cards:', err);
      showNotification('Error resetting defaults', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error' 
            ? 'bg-rose-500 text-white shadow-rose-500/20' 
            : 'bg-[#c79c6e] text-black shadow-[#c79c6e]/20'
        }`}>
          <CheckCircle size={16} weight="bold" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold flex items-center gap-1.5">
              <SlidersHorizontal size={14} weight="bold" />
              CURRICULUM HIGHLIGHTS &amp; CARDS CONTROL
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-white">"What you will master" Cards</h2>
          <p className="font-sans text-xs text-white/50 mt-1 max-w-xl">
            Control the 8 curriculum cards shown on the course landing page. Add new cards, edit descriptions, adjust order, or toggle visibility in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={fetchCards}
            disabled={loading}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh list"
          >
            <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            title="Restore initial 8 cards"
          >
            <ArrowsClockwise size={15} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-3 rounded-xl bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(199,156,110,0.2)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Add New Card</span>
          </button>
        </div>
      </div>

      {/* Info Callout */}
      <div className="mb-8 p-4 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-start gap-3">
        <Info size={18} className="text-[#c79c6e] shrink-0 mt-0.5" />
        <div className="text-xs font-sans text-white/80 leading-relaxed">
          These cards directly populate the <strong className="text-white">"The Curriculum — What you will master"</strong> section on the course landing page (<code className="text-[#c79c6e] font-mono">/course</code>). You can rearrange the cards or hide any card temporarily.
        </div>
      </div>

      {/* Cards List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CircleNotch size={32} className="animate-spin text-[#c79c6e] mb-3" />
          <p className="text-xs font-sans text-white/50 uppercase tracking-widest">Loading curriculum cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <SlidersHorizontal size={40} className="mx-auto text-white/30 mb-3" />
          <h3 className="font-serif text-lg text-white mb-1">No Curriculum Cards Found</h3>
          <p className="text-xs font-sans text-white/50 mb-5">Click "Reset Defaults" or add a new card to get started.</p>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-5 py-2.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider"
          >
            Restore Default 8 Cards
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, index) => (
            <div
              key={card._id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                card.isActive
                  ? 'bg-[#0a0a0a] border-white/10 hover:border-[#c79c6e]/30'
                  : 'bg-[#060606] border-white/5 opacity-60'
              }`}
            >
              <div>
                {/* Top Row: Index Badge & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-[#c79c6e]">
                      #{index + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold tracking-wider uppercase border ${
                      card.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {card.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  {/* Order Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 flex items-center justify-center transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={12} weight="bold" />
                    </button>
                    <button
                      type="button"
                      disabled={index === cards.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 flex items-center justify-center transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={12} weight="bold" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex gap-3 items-start">
                  <CheckCircle size={20} weight="fill" className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-white mb-1 group-hover:text-[#c79c6e] transition-colors">
                      {card.title}
                    </h4>
                    <p className="font-sans text-xs text-white/60 leading-relaxed line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleToggleActive(card)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                    card.isActive
                      ? 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      : 'bg-[#c79c6e]/10 border-[#c79c6e]/30 text-[#c79c6e]'
                  }`}
                  title={card.isActive ? 'Hide from landing page' : 'Show on landing page'}
                >
                  {card.isActive ? <EyeSlash size={14} /> : <Eye size={14} />}
                  <span>{card.isActive ? 'Hide' : 'Show'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(card)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PencilSimple size={14} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCard(card._id, card.title)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs transition-all flex items-center justify-center cursor-pointer"
                  title="Delete card"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-widest text-[#c79c6e] font-sans font-semibold block mb-1">
                {editingCard ? 'EDIT CARD' : 'CREATE NEW CARD'}
              </span>
              <h3 className="font-serif text-2xl text-white">
                {editingCard ? 'Edit Curriculum Card' : 'Add Curriculum Card'}
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-white/60 mb-1.5">
                  Card Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., The Foundation of Presence"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-white/60 mb-1.5">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Discover how to anchor yourself in any high-pressure situation with calm, unshakeable energy."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/60 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-wider text-white/60 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]/60"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs uppercase tracking-wider text-white/60 mb-1.5">
                    Visibility
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]/60"
                  >
                    <option value="true">Active (Published)</option>
                    <option value="false">Hidden (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="pt-2">
                <span className="block text-[10px] font-sans uppercase tracking-widest text-white/40 mb-1.5">
                  Live Card Preview:
                </span>
                <div className="p-4 rounded-xl border border-[#c79c6e]/30 bg-[#0a0a0a] flex gap-3 items-start">
                  <CheckCircle size={20} weight="fill" className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-sans text-xs font-semibold text-white mb-0.5">
                      {formData.title || 'Card Title Placeholder'}
                    </h5>
                    <p className="font-sans text-[11px] text-white/50 leading-relaxed">
                      {formData.description || 'Description will appear here on the landing page.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(199,156,110,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <CircleNotch size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCard ? 'Update Card' : 'Create Card'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
