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
import { API_URL } from '../../utils/apiUrl';

// Dedicated Dynamic Color Mark supporting any Category Accent Color (e.g. Pink, Mint Green, Coral, Sand, White, Gold)
export const ColorMark = Mark.create({
  name: 'textColor',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => {
          return (
            element.getAttribute('data-color') ||
            element.style?.color ||
            (element.hasAttribute('data-gold') || element.classList?.contains('text-gold') ? '#c79c6e' : null)
          );
        },
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            'data-color': attributes.color,
            style: `color: ${attributes.color} !important;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-color]',
        getAttrs: (element) => ({ color: element.getAttribute('data-color') || element.style.color }),
      },
      {
        tag: 'span[data-gold]',
        getAttrs: (element) => ({ color: element.getAttribute('data-color') || element.style.color || '#c79c6e' }),
      },
      {
        tag: 'span.text-gold',
        getAttrs: (element) => ({ color: element.getAttribute('data-color') || element.style.color || '#c79c6e' }),
      },
      {
        tag: 'span',
        getAttrs: (element) => {
          const color = element.style?.color;
          return color ? { color } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setColor: (color) => ({ commands }) => {
        return commands.setMark(this.name, { color });
      },
      toggleColor: (color) => ({ commands }) => {
        return commands.toggleMark(this.name, { color });
      },
      unsetColor: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
      // Aliases for backward compatibility
      setGold: () => ({ commands }) => {
        return commands.setMark(this.name, { color: '#c79c6e' });
      },
      toggleGold: () => ({ commands }) => {
        return commands.toggleMark(this.name, { color: '#c79c6e' });
      },
      unsetGold: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

// Legacy GoldMark alias definition in case of direct import
export const GoldMark = ColorMark;

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

function MenuBar({ editor, highlightColor = '#c79c6e', highlightLabel = 'Highlight' }) {
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
    editor.chain().focus().unsetAllMarks().unsetColor().clearNodes().setParagraph().run();
  };

  const activeColor = editor.getAttributes('textColor')?.color;
  const isColorActive = editor.isActive('textColor');
  const isCurrentColorActive =
    isColorActive &&
    Boolean(
      activeColor &&
      highlightColor &&
      activeColor.toLowerCase() === highlightColor.toLowerCase()
    );

  const handleColorToggle = () => {
    if (isCurrentColorActive) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(highlightColor).run();
    }
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
    <div className="flex flex-col border-b border-stone-200 bg-[#faf7f0] select-none text-xs">
      
      {/* ── Main Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5">
        {/* ── Block & Inline Heading Controls ── */}
        <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
          <button
            type="button"
            onClick={handleParagraphClick}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              editor.isActive('paragraph') && !editor.isActive('heading')
                ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
                ? 'text-[#c9542f] bg-[#c9542f]/10'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
                ? 'text-[#c9542f] bg-[#c9542f]/10'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
                ? 'text-[#c9542f] bg-[#c9542f]/10'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="Heading 3 (H3)"
          >
            H3
          </button>
        </div>

        {/* ── Inline Font Size Selector for specific selected text ── */}
        <div className="flex items-center bg-white border border-stone-200 rounded-lg px-2.5 py-1 gap-1.5 shadow-sm">
          <TextAa size={14} className="text-[#c9542f]" />
          <select
            onChange={(e) => setFontSize(e.target.value)}
            value={editor.getAttributes('textStyle').fontSize || ''}
            className="bg-white text-stone-800 text-xs focus:outline-none cursor-pointer border-none font-medium pr-1"
            title="Font Size (Selected Text)"
          >
            {FONT_SIZES.map((fs) => (
              <option key={fs.label} value={fs.value} className="bg-white text-stone-900 py-1">
                {fs.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[1px] h-5 bg-stone-200 mx-0.5" />

        {/* ── Category Specific Highlight Color Button ── */}
        <button
          type="button"
          onClick={handleColorToggle}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-sm text-xs font-medium"
          style={
            isColorActive
              ? {
                  backgroundColor: `${highlightColor}20`,
                  borderColor: highlightColor,
                  color: highlightColor,
                  fontWeight: 700,
                  boxShadow: `0 0 10px ${highlightColor}30`,
                }
              : {
                  backgroundColor: '#ffffff',
                  borderColor: '#e7e5e4',
                  color: '#44403c',
                }
          }
          title={`Apply ${highlightLabel} Highlight Color (${highlightColor})`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm inline-block shrink-0 ring-1 ring-black/10"
            style={{ backgroundColor: highlightColor }}
          />
          <span className="tracking-wide">{highlightLabel}</span>
        </button>

        <div className="w-[1px] h-5 bg-stone-200 mx-0.5" />

        {/* ── Text Inline Styling Marks (Bold, Italic, Underline, Strike, Highlight) ── */}
        <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('bold') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Bold (Ctrl+B)"
          >
            <TextB size={15} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('italic') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Italic (Ctrl+I)"
          >
            <TextItalic size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('underline') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Underline (Ctrl+U)"
          >
            <TextUnderline size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('strike') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Strikethrough"
          >
            <TextStrikethrough size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#c9542f25' }).run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('highlight') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Marker Highlighter"
          >
            <HighlighterCircle size={15} />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-stone-200 mx-0.5" />

        {/* ── Lists & Blockquote ── */}
        <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('bulletList') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Bullet List"
          >
            <ListBullets size={16} weight={editor.isActive('bulletList') ? 'bold' : 'regular'} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('orderedList') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Numbered List"
          >
            <ListNumbers size={16} weight={editor.isActive('orderedList') ? 'bold' : 'regular'} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive('blockquote') ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Blockquote / Quote"
          >
            <Quotes size={16} weight={editor.isActive('blockquote') ? 'bold' : 'regular'} />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-stone-200 mx-0.5" />

        {/* ── Alignment ── */}
        <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'left' }) ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Align Left"
          >
            <TextAlignLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'center' }) ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Align Center"
          >
            <TextAlignCenter size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'right' }) ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Align Right"
          >
            <TextAlignRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${editor.isActive({ textAlign: 'justify' }) ? 'text-[#c9542f] bg-[#c9542f]/10 font-bold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            title="Justify"
          >
            <TextAlignJustify size={15} />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-stone-200 mx-0.5" />

        {/* ── Image Upload Button ── */}
        <label className="p-1.5 rounded-lg transition-colors text-stone-700 hover:text-[#c9542f] hover:bg-stone-100 cursor-pointer flex items-center justify-center gap-1.5 bg-white border border-stone-200 px-2.5 shadow-sm" title="Upload & Insert Image">
          <ImageIcon size={15} className="text-[#c9542f]" />
          <span className="text-xs font-medium text-stone-800">Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        {/* ── Clear / Eraser & Undo / Redo ── */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={clearFormatting}
            className="p-1.5 rounded-lg transition-colors text-stone-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer border border-transparent hover:border-rose-200"
            title="Clear All Formatting"
          >
            <Eraser size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg transition-colors text-stone-600 hover:text-stone-900 hover:bg-white hover:border hover:border-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <ArrowCounterClockwise size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg transition-colors text-stone-600 hover:text-stone-900 hover:bg-white hover:border hover:border-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <ArrowClockwise size={16} />
          </button>
        </div>
      </div>

      {/* ── Top Image Alignment & Size Control Bar ── */}
      {isImageSelected && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-stone-100 border-t border-stone-200 animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Left: Align Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1">
              <ImageIcon size={14} className="text-[#c9542f]" />
              Wrap / Align:
            </span>
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setImageAlign('left')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  activeAlign === 'left'
                    ? 'bg-[#c9542f] text-white font-bold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
                    ? 'bg-[#c9542f] text-white font-bold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
                    ? 'bg-[#c9542f] text-white font-bold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1">
              <ArrowsInLineHorizontal size={14} className="text-[#c9542f]" />
              Width:
            </span>
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
              {['25%', '50%', '75%', '100%'].map((w) => {
                const isCurrent = activeWidth === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setImageWidth(w)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#c9542f] text-white font-bold shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer text-xs font-medium shadow-sm"
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

export default function TiptapEditor({
  value,
  content,
  onChange,
  highlightColor = '#c79c6e',
  highlightLabel = 'Highlight',
  placeholder = 'Write content here...'
}) {
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
      ColorMark,
      Underline,
      Highlight.configure({ multicolor: true }),
      CustomImage,
      HeadingEnterToParagraph,
    ],
    content: initialData,
    editorProps: {
      attributes: {
        class:
          'tiptap-content max-w-none focus:outline-none min-h-[420px] p-6 text-stone-900 text-base leading-relaxed font-sans custom-scrollbar',
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
    <div
      className="tiptap-editor-container border border-stone-200 rounded-xl overflow-hidden transition-all bg-white shadow-sm relative focus-within:border-[#c9542f] focus-within:ring-1 focus-within:ring-[#c9542f]/30"
    >
      <style>{`
        .tiptap-editor-container .ProseMirror {
          outline: none !important;
          color: #1c1917;
          font-size: 1rem;
          line-height: 1.8;
          min-height: 380px;
        }
        .tiptap-editor-container .ProseMirror p {
          margin: 0.65rem 0;
          color: #1c1917;
        }
        .tiptap-editor-container .ProseMirror h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.85rem;
          font-weight: 700;
          color: #111010;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .tiptap-editor-container .ProseMirror h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111010;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.35;
        }
        .tiptap-editor-container .ProseMirror h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111010;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        /* Explicit List styling */
        .tiptap-editor-container .ProseMirror ul,
        .tiptap-content ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin: 0.85rem 0 !important;
        }
        .tiptap-editor-container .ProseMirror ol,
        .tiptap-content ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin: 0.85rem 0 !important;
        }
        .tiptap-editor-container .ProseMirror li,
        .tiptap-content li {
          margin: 0.35rem 0 !important;
          display: list-item !important;
          color: #1c1917 !important;
        }
        .tiptap-editor-container .ProseMirror li p,
        .tiptap-content li p {
          margin: 0 !important;
          display: inline;
        }
        /* Explicit Blockquote styling */
        .tiptap-editor-container .ProseMirror blockquote,
        .tiptap-content blockquote {
          border-left: 3px solid #c9542f !important;
          padding: 0.65rem 1.25rem !important;
          margin: 1.25rem 0 !important;
          font-style: italic !important;
          color: #44403c !important;
          background: #faf7f0 !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
        }
        .tiptap-editor-container .ProseMirror [data-color] {
          /* Styled dynamically via inline style */
        }
        .tiptap-editor-container .ProseMirror [data-gold]:not([data-color]),
        .tiptap-editor-container .ProseMirror .text-gold:not([data-color]) {
          color: ${highlightColor || '#c9542f'} !important;
        }
        .tiptap-editor-container .ProseMirror strong,
        .tiptap-editor-container .ProseMirror b {
          font-weight: 700;
          color: #111010;
        }
        .tiptap-editor-container .ProseMirror mark {
          background-color: rgba(201, 84, 47, 0.15);
          color: inherit;
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
        }
        .tiptap-editor-container .ProseMirror::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>
      <MenuBar editor={editor} highlightColor={highlightColor} highlightLabel={highlightLabel} />
      <EditorContent editor={editor} className="bg-white min-h-[380px]" />
    </div>
  );
}
