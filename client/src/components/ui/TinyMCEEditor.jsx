import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { API_URL } from '../../utils/apiUrl';

export default function TinyMCEEditor({
  content,
  value,
  initialContent,
  onChange,
  placeholder = 'Write your thoughts here...',
  minHeight = 280,
  apiKey: propApiKey
}) {
  const editorRef = useRef(null);
  const currentVal = value !== undefined ? value : content !== undefined ? content : initialContent || '';
  
  const [apiKey, setApiKey] = useState(() => {
    return propApiKey || import.meta.env.VITE_TINYMCE_API_KEY || localStorage.getItem('tinymce_api_key') || 'no-api-key';
  });

  useEffect(() => {
    if (propApiKey) {
      setApiKey(propApiKey);
      return;
    }
    // Fetch dynamically from server settings
    fetch(`${API_URL}/api/visual-settings/tinymce`)
      .then(res => res.json())
      .then(data => {
        if (data?.apiKey && data.apiKey !== 'no-api-key') {
          setApiKey(data.apiKey);
          localStorage.setItem('tinymce_api_key', data.apiKey);
        }
      })
      .catch(() => {});
  }, [propApiKey]);

  return (
    <div className="tinymce-note-wrapper w-full rounded-2xl overflow-hidden border border-[#e4dfd9] bg-white shadow-xs transition-all focus-within:border-[#c8512d] focus-within:ring-1 focus-within:ring-[#c8512d]/30">
      <Editor
        apiKey={apiKey || 'no-api-key'}
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={currentVal}
        onEditorChange={(newHtml) => {
          if (onChange) {
            onChange(newHtml);
          }
        }}
        init={{
          height: minHeight,
          menubar: false,
          plugins: [
            'autolink', 'lists', 'link', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'fullscreen',
            'wordcount', 'directionality'
          ],
          toolbar:
            'undo redo | bold italic underline strikethrough | forecolor backcolor | bullist numlist | blockquote removeformat | preview fullscreen',
          toolbar_mode: 'floating',
          placeholder: placeholder,
          branding: false,
          promotion: false,
          statusbar: true,
          elementpath: false,
          entity_encoding: 'raw',
          forced_root_block: 'p',
          content_style: `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              font-size: 14.5px;
              line-height: 1.6;
              color: #1c1714;
              padding: 16px 18px;
              background-color: #ffffff;
            }
            p {
              margin: 0 0 8px 0;
            }
            blockquote {
              border-left: 3px solid #c8512d;
              padding: 6px 14px;
              margin: 12px 0;
              font-style: italic;
              color: #5f5750;
              background: #faf8f6;
              border-radius: 0 8px 8px 0;
            }
            ul, ol {
              padding-left: 22px;
              margin: 8px 0;
            }
          `,
        }}
      />
    </div>
  );
}
