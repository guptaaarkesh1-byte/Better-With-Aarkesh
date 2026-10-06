import React, { useEffect } from 'react';
import Icon from './AdminIcons';

export default function AdminConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
  children
}) {
  const handleClose = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="bwa-modal on" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bwa-mbox" role="dialog" aria-modal="true">
        <h3>{title}</h3>
        {message && <p style={{ margin: '0 0 12px', color: '#5b4d43', fontSize: '14px', lineHeight: 1.5 }}>{message}</p>}
        {children}
        <div className="bwa-mact">
          <button type="button" className="bwa-btn" onClick={handleClose}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`bwa-btn ${isDanger ? 'red' : 'pri'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
