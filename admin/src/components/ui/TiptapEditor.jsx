import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import {
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  ListNumbers,
  ListBullets,
  Quotes,
  Image as ImageIcon,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  HighlighterCircle,
  TextAa,
  ArrowCounterClockwise,
  ArrowClockwise,
  Eraser,
  Trash,
  ArrowsInLineHorizontal,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  ArrowsOutSimple,
  DotsSixVertical
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Dedicated Brand Gold Mark for 100% reliable gold coloring on ANY text (bold, italic, normal)
export const GoldMark = Mark.create({
  name: 'gold',

  parseHTML() {
    return [
      { tag: 'span[data-gold]' },
      { tag: 'span.text-gold' },
      {
        tag: 'span',
        getAttrs: (element) => {
          const style = element.getAttribute('style') || '';
          const color = element.style?.color;
          if (
            color === 'rgb(199, 156, 110)' ||
            color === '#c79c6e' ||
            style.includes('#c79c6e') ||
            style.includes('199, 156, 110')
          ) {
            return {};
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-gold': 'true',
        class: 'text-[#c79c6e] text-gold',
        style: 'color: #c79c6e !important;',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleGold: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
      setGold: () => ({ commands }) => {
        return commands.setMark(this.name);
      },
      unsetGold: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

// Interactive React NodeView for Image with Float/Text-Wrapping, Drag-to-Resize handle & Drag-to-move
function ResizableImageNodeView(props) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const currentAlign = node.attrs.alignment || node.attrs['data-align'] || 'center';
  const width = node.attrs.width || node.attrs['data-width'] || '100%';
  const { src, alt } = node.attrs;

  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    setCurrentWidth(width);
  }, [width]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = containerRef.current ? containerRef.current.offsetWidth : 400;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const editorEl = containerRef.current?.closest('.ProseMirror') || document.body;
      const editorWidth = editorEl.offsetWidth || 800;
      const newPx = Math.max(120, Math.min(editorWidth, startWidthRef.current + deltaX));
      const percentage = Math.round((newPx / editorWidth) * 100);
      const clampedPct = Math.max(15, Math.min(100, percentage));
      const finalWidthStr = `${clampedPct}%`;
      setCurrentWidth(finalWidthStr);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current) {
        const editorEl = containerRef.current?.closest('.ProseMirror') || document.body;
        const editorWidth = editorEl.offsetWidth || 800;
        const currentPx = containerRef.current.offsetWidth;
        const pct = Math.round((currentPx / editorWidth) * 100);
        const finalWidthStr = `${Math.max(15, Math.min(100, pct))}%`;
        updateAttributes({ width: finalWidthStr, 'data-width': finalWidthStr });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleAlignChange = (newAlign) => {
    let newWidth = currentWidth;
    if (newAlign !== 'center' && (currentWidth === '100%' || !currentWidth)) {
      newWidth = '50%';
      setCurrentWidth('50%');
    }
    updateAttributes({ 
      alignment: newAlign, 
      'data-align': newAlign,
      width: newWidth,
      'data-width': newWidth
    });
  };

  let floatStyle = {};
  if (currentAlign === 'left') {
    floatStyle = {
      float: 'left',
      width: currentWidth,
      maxWidth: '100%',
      marginRight: '1.5rem',
      marginBottom: '1rem',
      marginTop: '0.5rem',
      clear: 'none',
      display: 'inline-block',
    };
  } else if (currentAlign === 'right') {
    floatStyle = {
      float: 'right',
      width: currentWidth,
      maxWidth: '100%',
      marginLeft: '1.5rem',
      marginBottom: '1rem',
      marginTop: '0.5rem',
      clear: 'none',
      display: 'inline-block',
    };
  } else {
    floatStyle = {
      float: 'none',
      width: currentWidth,
      maxWidth: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
      display: 'block',
      clear: 'both',
    };
  }

  return (
    <NodeViewWrapper 
      data-drag-handle
      className={`relative select-none group/img transition-all ${
        currentAlign === 'left' 
          ? 'float-left mr-6 mb-4 mt-2' 
          : currentAlign === 'right' 
          ? 'float-right ml-6 mb-4 mt-2' 
          : 'mx-auto my-6 block clear-both'
      }`}
      style={floatStyle}
    >
      <div 
        ref={containerRef}
        className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
          selected || isResizing 
            ? 'ring-2 ring-[#c79c6e] shadow-[0_0_30px_rgba(199,156,110,0.4)]' 
            : 'border border-white/10 hover:border-[#c79c6e]/50'
        }`}
      >
        <img 
          src={src} 
          alt={alt || ''} 
          className="w-full h-auto object-cover rounded-xl block pointer-events-none select-none"
          draggable="false"
        />

        {/* Drag to Move Gripper Header */}
        <div 
          data-drag-handle
          className="absolute top-2 left-2 z-20 flex items-center justify-center w-7 h-7 rounded-lg bg-black/85 backdrop-blur-md border border-white/20 text-white/70 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
          title="Drag to Move Image across text"
        >
          <DotsSixVertical size={16} weight="bold" />
        </div>

        {/* Floating Quick Action Overlay when image is selected or hovered */}
        <div className={`absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-black/90 backdrop-blur-md border border-[#c79c6e]/40 rounded-full px-2.5 py-1 shadow-2xl transition-opacity duration-200 ${
          selected ? 'opacity-100' : 'opacity-0 group-hover/img:opacity-100'
        }`}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleAlignChange('left'); }}
            className={`p-1 rounded-full text-xs transition-colors cursor-pointer ${currentAlign === 'left' ? 'bg-[#c79c6e] text-black font-bold' : 'text-white/70 hover:text-white'}`}
            title="Float Left (Text wraps on right)"
          >
            <AlignLeft size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleAlignChange('center'); }}
            className={`p-1 rounded-full text-xs transition-colors cursor-pointer ${currentAlign === 'center' ? 'bg-[#c79c6e] text-black font-bold' : 'text-white/70 hover:text-white'}`}
            title="Center (No wrap)"
          >
            <AlignCenterHorizontal size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleAlignChange('right'); }}
            className={`p-1 rounded-full text-xs transition-colors cursor-pointer ${currentAlign === 'right' ? 'bg-[#c79c6e] text-black font-bold' : 'text-white/70 hover:text-white'}`}
            title="Float Right (Text wraps on left)"
          >
            <AlignRight size={13} />
          </button>
          
          <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" />
          
          <span className="text-[10px] text-[#c79c6e] font-mono px-1 font-semibold">
            {currentWidth}
          </span>

          <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); deleteNode(); }}
            className="p-1 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
            title="Remove Image"
          >
            <Trash size={13} />
          </button>
        </div>

        {/* Interactive Drag-to-Resize Handle on Bottom-Right */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-[#c79c6e] text-black flex items-center justify-center cursor-nwse-resize shadow-[0_2px_12px_rgba(0,0,0,0.8)] transition-all hover:scale-125 z-30 ${
            selected || isResizing ? 'opacity-100 scale-110' : 'opacity-0 group-hover/img:opacity-100'
          }`}
          title="Drag corner to smoothly resize image width"
        >
          <ArrowsOutSimple size={13} weight="bold" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// Custom Image Extension with Float / Alignment, Width & Drag Support
export const CustomImage = Image.extend({
  name: 'image',
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) => {
          return element.getAttribute('data-width') || element.style.width || element.getAttribute('width') || '100%';
        },
        renderHTML: (attributes) => {
          return {
            'data-width': attributes.width || '100%',
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => {
          const align = element.getAttribute('data-align') || element.style.float;
          return align || 'center';
        },
        renderHTML: (attributes) => {
          return {
            'data-align': attributes.alignment || 'center',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          let align = element.getAttribute('data-align');
          if (!align) {
            if (element.style.float === 'left') align = 'left';
            else if (element.style.float === 'right') align = 'right';
            else align = 'center';
          }
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            width: element.style?.width || element.getAttribute('data-width') || '100%',
            alignment: align,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const alignment = HTMLAttributes['data-align'] || HTMLAttributes.alignment || 'center';
    const width = HTMLAttributes['data-width'] || HTMLAttributes.width || '100%';

    let floatStyle = 'display: block; margin: 1.5rem auto; clear: both;';
    if (alignment === 'left') {
      floatStyle = 'float: left; margin: 0.5rem 1.5rem 1rem 0; clear: none; display: inline-block;';
    } else if (alignment === 'right') {
      floatStyle = 'float: right; margin: 0.5rem 0 1rem 1.5rem; clear: none; display: inline-block;';
    }

    const style = `width: ${width}; max-width: 100%; border-radius: 0.75rem; ${floatStyle}`;

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style,
        'data-align': alignment,
        'data-width': width,
        class: `tiptap-image image-align-${alignment} rounded-xl shadow-lg border border-white/10 transition-all`,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

// Extended TextStyle to support custom inline font sizes on selected text
const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});

// Extension: When pressing Enter at the end of a heading, automatically create a new Paragraph (<p>)
const HeadingEnterToParagraph = Extension.create({
  name: 'headingEnterToParagraph',
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (empty && $from.parent.type.name === 'heading') {
          if ($from.parentOffset === $from.parent.content.size) {
            return editor.chain().insertContentAt($from.after(), { type: 'paragraph' }).focus().run();
          }
        }
        return false;
      },
    };
  },
});

const FONT_SIZES = [
  { label: 'Normal (16px)', value: '' },
  { label: 'Small (13px)', value: '13px' },
  { label: 'Medium (18px)', value: '18px' },
  { label: 'Large (22px)', value: '22px' },
  { label: 'XL (28px)', value: '28px' },
  { label: '2XL (34px)', value: '34px' },
  { label: 'Display (44px)', value: '44px' }
];

function MenuBar({ editor }) {
  if (!editor) {
    return null;
  }

  const isImageSelected = editor.isActive('image');
  const imageAttrs = editor.getAttributes('image');
  const activeAlign = imageAttrs.alignment || imageAttrs['data-align'] || 'center';
  const activeWidth = imageAttrs.width || imageAttrs['data-width'] || '100%';

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      editor
        .chain()
        .focus()
        .setImage({ 
          src: `${API_URL}${data.imageUrl}`,
          width: '100%',
          alignment: 'center',
          'data-width': '100%',
          'data-align': 'center'
        })
        .run();
    } catch (error) {
      console.error(error);
      alert('Unable to upload image right now.');
    }
    
    event.target.value = '';
  };

  const handleParagraphClick = () => {
    const { from, to, empty } = editor.state.selection;
    const parent = editor.state.selection.$from.parent;
    const isEntireBlock = empty || (to - from) >= parent.content.size;

    if (isEntireBlock) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setMark('textStyle', { fontSize: null }).unsetBold().run();
    }
  };

  const handleHeadingClick = (level) => {
    const { from, to, empty } = editor.state.selection;
    const parent = editor.state.selection.$from.parent;
    const isEntireBlock = empty || (to - from) >= parent.content.size;

    if (isEntireBlock) {
      editor.chain().focus().toggleHeading({ level }).run();
    } else {
      const sizeMap = { 1: '34px', 2: '24px', 3: '20px' };
      const currentSize = editor.getAttributes('textStyle').fontSize;
      if (currentSize === sizeMap[level]) {
        editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
      } else {
        editor.chain().focus().setMark('textStyle', { fontSize: sizeMap[level] }).setBold().run();
      }
    }
  };

  const setFontSize = (size) => {
    if (!size) {
      editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
    } else {
      editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
    }
  };

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().unsetGold().clearNodes().setParagraph().run();
  };

  const isGoldActive = editor.isActive('gold');

  const handleGoldToggle = () => {
    editor.chain().focus().toggleGold().run();
  };

  const setImageAlign = (newAlign) => {
    let newWidth = activeWidth;
    if (newAlign !== 'center' && (activeWidth === '100%' || !activeWidth)) {
      newWidth = '50%';
    }
    editor.chain().focus().updateAttributes('image', { 
      alignment: newAlign, 
      'data-align': newAlign,
      width: newWidth,
      'data-width': newWidth
    }).run();
  };

  const setImageWidth = (newWidth) => {
    editor.chain().focus().updateAttributes('image', { 
      width: newWidth,
      'data-width': newWidth 
    }).run();
  };

  const handleDeleteImage = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <div className="flex flex-col border-b border-white/10 bg-[#12100e] select-none text-xs">
      
      {/* ── Main Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5">
        {/* ── Block & Inline Heading Controls ── */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
          <button
            type="button"
            onClick={handleParagraphClick}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              editor.isActive('paragraph') && !editor.isActive('heading')
                ? 'text-[#c79c6e] bg-[#c79c6e]/20 font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Normal Paragraph (P)"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => handleHeadingClick(1)}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'text-[#c79c6e] bg-[#c79c6e]/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Heading 1 (H1)"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => handleHeadingClick(2)}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'text-[#c79c6e] bg-[#c79c6e]/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Heading 2 (H2)"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => handleHeadingClick(3)}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 3 })
                ? 'text-[#c79c6e] bg-[#c79c6e]/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Heading 3 (H3)"
          >
            H3
          </button>
        </div>

        {/* ── Inline Font Size Selector for specific selected text ── */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-2 py-1 gap-1">
          <TextAa size={14} className="text-[#c79c6e]" />
          <select
            onChange={(e) => setFontSize(e.target.value)}
            value={editor.getAttributes('textStyle').fontSize || ''}
            className="bg-transparent text-white/80 text-xs focus:outline-none cursor-pointer border-none"
            title="Font Size (Selected Text)"
          >
            {FONT_SIZES.map((fs) => (
              <option key={fs.label} value={fs.value} className="bg-[#1a1714] text-white">
                {fs.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

        {/* ── Brand Gold Color Direct Toggle (Dedicated Mark) ── */}
        <button
          type="button"
          onClick={handleGoldToggle}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            isGoldActive
              ? 'bg-[#c79c6e]/25 border-[#c79c6e] text-[#c79c6e] font-semibold shadow-[0_0_12px_rgba(199,156,110,0.35)] ring-1 ring-[#c79c6e]/50'
              : 'bg-black/40 border-white/10 text-white/80 hover:text-[#c79c6e] hover:border-[#c79c6e]/50'
          }`}
          title="Apply Brand Gold Color (#c79c6e)"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#c79c6e] shadow-sm inline-block shrink-0" />
          <span className="font-medium tracking-wide">Gold</span>
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

        {/* ── Text Inline Styling Marks (Bold, Italic, Underline, Strike, Highlight) ── */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('bold') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Bold (Ctrl+B)"
          >
            <TextB size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('italic') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Italic (Ctrl+I)"
          >
            <TextItalic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('underline') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Underline (Ctrl+U)"
          >
            <TextUnderline size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('strike') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Strikethrough"
          >
            <TextStrikethrough size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#c79c6e33' }).run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('highlight') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Gold Highlighter Marker"
          >
            <HighlighterCircle size={16} />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

        {/* ── Lists & Blockquote ── */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('bulletList') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Bullet List"
          >
            <ListBullets size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('orderedList') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Numbered List"
          >
            <ListNumbers size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('blockquote') ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Blockquote"
          >
            <Quotes size={16} />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

        {/* ── Alignment ── */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'left' }) ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Align Left"
          >
            <TextAlignLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'center' }) ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Align Center"
          >
            <TextAlignCenter size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'right' }) ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Align Right"
          >
            <TextAlignRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'justify' }) ? 'text-[#c79c6e] bg-[#c79c6e]/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Justify"
          >
            <TextAlignJustify size={16} />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

        {/* ── Image Upload Button ── */}
        <label className="p-1.5 rounded transition-colors text-white/70 hover:text-[#c79c6e] hover:bg-white/10 cursor-pointer flex items-center justify-center gap-1 bg-black/40 border border-white/10 px-2" title="Upload & Insert Image">
          <ImageIcon size={16} />
          <span className="text-[11px] font-medium text-white/80">Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        {/* ── Clear / Eraser & Undo / Redo ── */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={clearFormatting}
            className="p-1.5 rounded transition-colors text-white/50 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
            title="Clear All Formatting"
          >
            <Eraser size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded transition-colors text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <ArrowCounterClockwise size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded transition-colors text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <ArrowClockwise size={16} />
          </button>
        </div>
      </div>

      {/* ── Top Image Alignment & Size Control Bar ── */}
      {isImageSelected && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-[#1a1510] border-t border-[#c79c6e]/40 animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Left: Align Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-1">
              <ImageIcon size={14} />
              Wrap / Align:
            </span>
            <div className="flex items-center bg-black/60 border border-white/15 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setImageAlign('left')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  activeAlign === 'left'
                    ? 'bg-[#c79c6e] text-black font-bold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Float Left (Text wraps on right)"
              >
                <AlignLeft size={14} />
                <span>Wrap Right</span>
              </button>
              <button
                type="button"
                onClick={() => setImageAlign('center')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  activeAlign === 'center'
                    ? 'bg-[#c79c6e] text-black font-bold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Center (Full line, no wrap)"
              >
                <AlignCenterHorizontal size={14} />
                <span>Center</span>
              </button>
              <button
                type="button"
                onClick={() => setImageAlign('right')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  activeAlign === 'right'
                    ? 'bg-[#c79c6e] text-black font-bold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Float Right (Text wraps on left)"
              >
                <AlignRight size={14} />
                <span>Wrap Left</span>
              </button>
            </div>
          </div>

          {/* Center: Width / Size Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-1">
              <ArrowsInLineHorizontal size={14} />
              Width:
            </span>
            <div className="flex items-center bg-black/60 border border-white/15 rounded-lg p-0.5">
              {['25%', '50%', '75%', '100%'].map((w) => {
                const isCurrent = activeWidth === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setImageWidth(w)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#c79c6e] text-black font-bold shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Delete Image button */}
          <button
            type="button"
            onClick={handleDeleteImage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer text-xs"
            title="Remove Image"
          >
            <Trash size={14} />
            <span>Delete</span>
          </button>

        </div>
      )}

    </div>
  );
}

export default function TiptapEditor({ value, content, onChange }) {
  const initialData = value !== undefined ? value : content !== undefined ? content : '';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CustomTextStyle,
      GoldMark,
      Underline,
      Highlight.configure({ multicolor: true }),
      CustomImage,
      HeadingEnterToParagraph,
    ],
    content: initialData,
    editorProps: {
      attributes: {
        class:
          'tiptap-content prose prose-invert max-w-none focus:outline-none min-h-[480px] p-6 text-white/85 text-sm sm:text-base leading-relaxed font-sans prose-headings:font-serif prose-headings:font-normal prose-headings:text-white prose-h1:text-3xl prose-h1:font-serif prose-h1:text-white prose-h2:text-2xl prose-h2:text-[#c79c6e] prose-h2:font-serif prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:text-white prose-p:my-2 prose-p:text-white/80 prose-ul:text-white/80 prose-li:my-1.5 prose-a:text-[#c79c6e] prose-blockquote:border-l-2 prose-blockquote:border-[#c79c6e] prose-blockquote:pl-4 prose-blockquote:italic custom-scrollbar',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (onChange) {
        onChange(currentEditor.getHTML());
      }
    },
  });

  useEffect(() => {
    const currentVal = value !== undefined ? value : content !== undefined ? content : '';
    if (editor && currentVal !== editor.getHTML()) {
      editor.commands.setContent(currentVal || '', false);
    }
  }, [editor, value, content]);

  return (
    <div className="tiptap-editor-container border border-white/10 rounded-xl overflow-hidden focus-within:border-[#c79c6e]/50 transition-colors bg-[#0a0a0a] shadow-lg relative">
      <style>{`
        .tiptap-editor-container .ProseMirror [data-gold],
        .tiptap-editor-container .ProseMirror [data-gold] *,
        .tiptap-editor-container .ProseMirror .text-gold,
        .tiptap-editor-container .ProseMirror .text-gold * {
          color: #c79c6e !important;
        }
        .tiptap-editor-container .ProseMirror strong,
        .tiptap-editor-container .ProseMirror b {
          font-weight: 700;
        }
        .tiptap-editor-container .ProseMirror::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-transparent" />
    </div>
  );
}
