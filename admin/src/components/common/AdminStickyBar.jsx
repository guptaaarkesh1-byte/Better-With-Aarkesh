import React from 'react';
import Icon from './AdminIcons';

export default function AdminStickyBar({
  title,
  backUrl,
  backText = '‹ Back',
  statusMode = null, // 'live-switch' | 'chip' | null
  status = null, // 'live' | 'soon' | 'draft'
  isLive = false,
  isSoon = false,
  onStatusChange,
  onToggleLive,
  extraLeft,
  extraRight,
  dirty = false,
  isSaving = false,
  onSave,
  saveText = 'Save changes',
  savedText = 'All changes saved',
  unsavedText = 'Unsaved changes',
  showSave = true
}) {
  const currentStatus = status || (isLive ? 'live' : (isSoon ? 'soon' : 'draft'));

  const handleStatus = (next) => {
    if (onStatusChange) {
      onStatusChange(next);
    } else if (onToggleLive) {
      onToggleLive(next === 'live');
    }
  };

  return (
    <div className="bwa-cbar">
      <div className="bwa-cl">
        {backUrl && (
          <a href={backUrl} className="bwa-back">
            {backText}
          </a>
        )}
        {title && <span className="bwa-ctitle">{title}</span>}

        {statusMode === 'live-switch' && (
          <div className="bwa-seg" role="group" aria-label="Status mode">
            <button
              type="button"
              className={currentStatus === 'draft' ? 'on' : ''}
              onClick={() => handleStatus('draft')}
            >
              Draft
            </button>
            <button
              type="button"
              className={currentStatus === 'soon' ? 'on soon' : ''}
              onClick={() => handleStatus('soon')}
            >
              <span className="dot" style={{ background: 'var(--amber)' }} />
              Coming soon
            </button>
            <button
              type="button"
              className={currentStatus === 'live' ? 'on live' : ''}
              onClick={() => handleStatus('live')}
            >
              <span className="dot" />
              Live
            </button>
          </div>
        )}

        {extraLeft}
      </div>

      <div className="bwa-cr">
        {extraRight}

        {showSave && (
          <>
            <span className={`bwa-sv ${dirty ? 'dirty' : ''}`}>
              <i style={{ background: dirty ? 'var(--amber)' : 'var(--green)' }} />
              {dirty ? unsavedText : savedText}
            </span>

            <button
              type="button"
              className="bwa-btn pri"
              disabled={!dirty || isSaving}
              onClick={onSave}
            >
              {isSaving ? 'Saving...' : saveText}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
