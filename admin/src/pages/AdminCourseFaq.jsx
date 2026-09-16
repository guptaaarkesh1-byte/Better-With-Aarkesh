import React, { useState, useEffect } from 'react';
import { 
  Question, 
  Plus, 
  PencilSimple, 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  ArrowClockwise, 
  CircleNotch, 
  Eye, 
  EyeSlash, 
  X, 
  Info,
  ArrowsClockwise,
  CheckCircle,
  ChatCircleText
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const INITIAL_DEFAULT_FAQS = [
  {
    question: 'How long do I have access to the course materials?',
    answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.',
    order: 0,
    isActive: true,
  },
  {
    question: 'How do the 3 free coaching sessions work?',
    answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.',
    order: 1,
    isActive: true,
  },
  {
    question: 'What format is the course delivered in?',
    answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.',
    order: 2,
    isActive: true,
  },
  {
    question: 'Is this course beginner-friendly?',
    answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.',
    order: 3,
    isActive: true,
  },
];

export default function AdminCourseFaq() {
  const [faqs, setFaqs] = useState(INITIAL_DEFAULT_FAQS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
    isActive: true,
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      let res = await fetch(`${API_URL}/api/courses/faqs/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        res = await fetch(`${API_URL}/api/courses/faqs/public`);
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        }
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      order: faqs.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      order: faq.order !== undefined ? faq.order : 0,
      isActive: faq.isActive !== undefined ? faq.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  // Save FAQ (Create or Update)
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      showNotification('Question and Answer are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const isEdit = Boolean(editingFaq && (editingFaq._id || editingFaq.id));
      const faqId = editingFaq?._id || editingFaq?.id || '';
      const url = isEdit
        ? `${API_URL}/api/courses/faqs/admin/${faqId}`
        : `${API_URL}/api/courses/faqs/admin`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showNotification(isEdit ? 'FAQ updated successfully' : 'New FAQ added successfully');
        handleCloseModal();
        fetchFaqs();
      } else {
        const errData = await res.json();
        showNotification(errData.message || 'Failed to save FAQ', 'error');
      }
    } catch (err) {
      console.error('Error saving FAQ:', err);
      showNotification('Error saving FAQ', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (id, question) => {
    if (!window.confirm(`Are you sure you want to delete this FAQ: "${question}"?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/faqs/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showNotification('FAQ deleted successfully');
        fetchFaqs();
      } else {
        showNotification('Failed to delete FAQ', 'error');
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      showNotification('Error deleting FAQ', 'error');
    }
  };

  // Toggle FAQ Active State
  const handleToggleActive = async (faq) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/faqs/admin/${faq._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !faq.isActive })
      });

      if (res.ok) {
        showNotification(`FAQ ${!faq.isActive ? 'activated' : 'deactivated'}`);
        fetchFaqs();
      }
    } catch (err) {
      console.error('Error toggling FAQ status:', err);
    }
  };

  // Move FAQ Order Up / Down
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setFaqs(updated);

    try {
      const token = localStorage.getItem('adminToken');
      await Promise.all(
        updated.map((f, i) =>
          fetch(`${API_URL}/api/courses/faqs/admin/${f._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ order: i })
          })
        )
      );
      showNotification('FAQ order updated');
    } catch (err) {
      console.error('Error updating order:', err);
      fetchFaqs();
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all course FAQs back to the default 4 questions? Any custom FAQs will be replaced.')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/faqs/admin/reset-defaults`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showNotification('Reset to default 4 FAQs successfully');
        fetchFaqs();
      } else {
        showNotification('Failed to reset defaults', 'error');
      }
    } catch (err) {
      console.error('Error resetting FAQs:', err);
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
              <ChatCircleText size={14} weight="bold" />
              COURSE FAQ CONTROL
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-white">Frequently Asked Questions</h2>
          <p className="font-sans text-xs text-white/50 mt-1 max-w-xl">
            Manage the questions and answers shown in the course landing page FAQ section ("Everything you need to know").
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={fetchFaqs}
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
            title="Restore initial 4 FAQs"
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
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Info Callout */}
      <div className="mb-8 p-4 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-start gap-3">
        <Info size={18} className="text-[#c79c6e] shrink-0 mt-0.5" />
        <div className="text-xs font-sans text-white/80 leading-relaxed">
          These FAQs directly appear in the <strong className="text-white">"Frequently Asked Questions — Everything you need to know"</strong> section on the course page (<code className="text-[#c79c6e] font-mono">/course</code>).
        </div>
      </div>

      {/* FAQ List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CircleNotch size={32} className="animate-spin text-[#c79c6e] mb-3" />
          <p className="text-xs font-sans text-white/50 uppercase tracking-widest">Loading FAQs...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <Question size={40} className="mx-auto text-white/30 mb-3" />
          <h3 className="font-serif text-lg text-white mb-1">No FAQs Found</h3>
          <p className="text-xs font-sans text-white/50 mb-5">Click "Reset Defaults" or add a new question.</p>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-5 py-2.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider"
          >
            Restore Default FAQs
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-5 group ${
                faq.isActive
                  ? 'bg-[#0a0a0a] border-white/10 hover:border-[#c79c6e]/30'
                  : 'bg-[#060606] border-white/5 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                {/* Status Badges */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-[#c79c6e]">
                    #{index + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold tracking-wider uppercase border ${
                    faq.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {faq.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <h3 className="font-serif text-lg text-white mb-2 group-hover:text-[#c79c6e] transition-colors">
                  {faq.question}
                </h3>
                <p className="font-sans text-xs md:text-sm text-white/60 leading-relaxed">
                  {faq.answer}
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end sm:self-center">
                {/* Reorder Buttons */}
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
                    disabled={index === faqs.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 flex items-center justify-center transition-colors cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown size={12} weight="bold" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(faq)}
                    className={`p-2 rounded-lg border text-xs font-sans transition-all flex items-center justify-center cursor-pointer ${
                      faq.isActive
                        ? 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        : 'bg-[#c79c6e]/10 border-[#c79c6e]/30 text-[#c79c6e]'
                    }`}
                    title={faq.isActive ? 'Hide from landing page' : 'Show on landing page'}
                  >
                    {faq.isActive ? <EyeSlash size={14} /> : <Eye size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(faq)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-sans transition-all flex items-center justify-center cursor-pointer"
                    title="Edit FAQ"
                  >
                    <PencilSimple size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq._id, faq.question)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs transition-all flex items-center justify-center cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash size={14} />
                  </button>
                </div>
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
                {editingFaq ? 'EDIT FAQ' : 'CREATE NEW FAQ'}
              </span>
              <h3 className="font-serif text-2xl text-white">
                {editingFaq ? 'Edit FAQ Item' : 'Add FAQ Item'}
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-white/60 mb-1.5">
                  Question <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., How long do I have access to the course materials?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-white/60 mb-1.5">
                  Answer <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g., You get lifetime access to all masterclass modules, downloadable resources, and future updates..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
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
                  Live Preview on Landing Page:
                </span>
                <div className="p-5 rounded-xl border border-[#c79c6e]/30 bg-[#0a0a0a]">
                  <h4 className="font-serif text-base text-white mb-1.5">
                    {formData.question || 'Your Question will appear here?'}
                  </h4>
                  <p className="font-sans text-xs text-white/60 leading-relaxed">
                    {formData.answer || 'Your answer explanation will appear here.'}
                  </p>
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
                    <span>{editingFaq ? 'Update FAQ' : 'Create FAQ'}</span>
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
