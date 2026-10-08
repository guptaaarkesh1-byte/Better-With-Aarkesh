import React, { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyMCEEditor({
  content,
  value,
  initialContent,
  onChange,
  highlightColor = '#c9542f',
  highlightLabel = 'Highlight',
  placeholder = 'Start writing your editorial content here...',
  minHeight = 460,
}) {
  const editorRef = useRef(null);
  const currentVal = value !== undefined ? value : content !== undefined ? content : initialContent || '';

  return (
    <div className="tinymce-editor-wrapper w-full rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm transition-all focus-within:border-[#c9542f] focus-within:ring-1 focus-within:ring-[#c9542f]/30">
      <Editor
        apiKey="j3wb3qfjfsjor8dgmndqixpa3nc1oeiq1kg6uay66wypfg6c"
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
          menubar: 'file edit view insert format tools table help',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'directionality'
          ],
          toolbar1:
            'undo redo | blocks fontfamily fontsize lineheight | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify',
          toolbar2:
            'bullist numlist outdent indent | table link image media | blockquote hr removeformat | code fullscreen preview',
          toolbar_mode: 'sliding',
          font_family_formats:
            'Fraunces=Fraunces,Georgia,serif; Inter=Inter,sans-serif; Georgia=georgia,palatino,serif; Times New Roman=times new roman,times,serif; Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Outfit=Outfit,sans-serif; Playfair Display=Playfair Display,serif',
          font_size_formats:
            '11px 12px 13px 14px 15px 16px 17px 18px 20px 22px 24px 28px 32px 36px 42px 48px',
          line_height_formats:
            '1 1.15 1.3 1.5 1.65 1.7 1.8 2 2.2 2.5',
          placeholder: placeholder,
          branding: false,
          promotion: false,
          statusbar: true,
          elementpath: true,
          entity_encoding: 'raw',
          forced_root_block: 'p',
          remove_trailing_brs: false,
          paste_data_images: true,
          content_style: `
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Fraunces', Georgia, serif;
              font-size: 1.12rem;
              line-height: 1.15;
              color: #1c1917;
              padding: 24px 32px;
              background-color: #ffffff;
            }
            p {
              margin-top: 0;
              margin-bottom: 0;
              line-height: 1.15;
            }
            p:empty, p > br:only-child {
              min-height: 1.15em;
              margin-bottom: 0;
              display: block;
            }
            h1 {
              font-family: 'Fraunces', Georgia, serif;
              font-size: 2.1rem;
              font-weight: 700;
              color: #111010;
              margin-top: 1.6rem;
              margin-bottom: 0.75rem;
              line-height: 1.2;
            }
            h2 {
              font-family: 'Fraunces', Georgia, serif;
              font-size: 1.65rem;
              font-weight: 600;
              color: #111010;
              margin-top: 1.4rem;
              margin-bottom: 0.6rem;
              line-height: 1.25;
            }
            h3 {
              font-family: 'Fraunces', Georgia, serif;
              font-size: 1.35rem;
              font-weight: 600;
              color: #111010;
              margin-top: 1.2rem;
              margin-bottom: 0.5rem;
              line-height: 1.3;
            }
            blockquote {
              border-left: 3px solid ${highlightColor || '#c9542f'};
              padding: 0.6rem 1.1rem;
              margin: 1.2rem 0;
              font-style: italic;
              color: #44403c;
              background: #faf8f5;
              border-radius: 0 0.5rem 0.5rem 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1.2rem 0;
            }
            table td, table th {
              border: 1px solid #e7e5e4;
              padding: 8px 12px;
            }
            table th {
              background-color: #f5f5f4;
              font-weight: 600;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
            }
          `,
          images_upload_handler: async (blobInfo, progress) => {
            return new Promise((resolve, reject) => {
              // Read image as Data URL base64 for instant zero-dependency display
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result);
              };
              reader.onerror = (err) => {
                reject('Image upload failed: ' + err);
              };
              reader.readAsDataURL(blobInfo.blob());
            });
          },
          quickbars_selection_toolbar:
            'bold italic underline | formatselect | quicklink blockquote',
          contextmenu: 'link image table',
        }}
      />
    </div>
  );
}
