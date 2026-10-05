import React, { useEffect } from 'react';
import Icon from './AdminIcons';

export default function AdminDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'min(640px, 100%)',
  ariaLabel = 'Editor Drawer'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`bwa-scrim ${isOpen ? 'on' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`bwa-drawer ${isOpen ? 'on' : ''}`}
        style={{ width }}
        aria-label={ariaLabel}
        aria-hidden={!isOpen}
      >
        <div className="bwa-dh">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="bwa-x"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="bwa-dbd">
          {children}
        </div>

        {footer && (
          <div className="bwa-dft">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
