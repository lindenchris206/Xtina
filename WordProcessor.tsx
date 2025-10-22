import React, { useState, useRef, useEffect } from 'react';

interface WordProcessorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onClose?: () => void;
  fileName?: string;
}

type TextAlignment = 'left' | 'center' | 'right' | 'justify';
type ListType = 'none' | 'bullet' | 'number';

export const WordProcessor: React.FC<WordProcessorProps> = ({
  initialContent = '',
  onSave,
  onClose,
  fileName = 'Untitled Document'
}) => {
  const [content, setContent] = useState(initialContent);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);
  const [alignment, setAlignment] = useState<TextAlignment>('left');
  const [listType, setListType] = useState<ListType>('none');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [showFormatting, setShowFormatting] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  useEffect(() => {
    const words = editorRef.current?.innerText.trim().split(/\s+/).filter(w => w.length > 0) || [];
    setWordCount(words.length);

    // Rough page count calculation (assuming ~250 words per page)
    setPageCount(Math.max(1, Math.ceil(words.length / 250)));
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = () => {
    if (onSave && editorRef.current) {
      onSave(editorRef.current.innerHTML);
      setHasUnsavedChanges(false);
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const toggleBold = () => {
    applyFormat('bold');
    setBold(!bold);
  };

  const toggleItalic = () => {
    applyFormat('italic');
    setItalic(!italic);
  };

  const toggleUnderline = () => {
    applyFormat('underline');
    setUnderline(!underline);
  };

  const toggleStrikethrough = () => {
    applyFormat('strikeThrough');
    setStrikethrough(!strikethrough);
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
    applyFormat('fontSize', '7');
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        range.surroundContents(span);
      }
    }
  };

  const changeFontFamily = (font: string) => {
    setFontFamily(font);
    applyFormat('fontName', font);
  };

  const changeTextColor = (color: string) => {
    setTextColor(color);
    applyFormat('foreColor', color);
  };

  const changeBackgroundColor = (color: string) => {
    setBackgroundColor(color);
    applyFormat('hiliteColor', color);
  };

  const changeAlignment = (align: TextAlignment) => {
    setAlignment(align);
    switch (align) {
      case 'left':
        applyFormat('justifyLeft');
        break;
      case 'center':
        applyFormat('justifyCenter');
        break;
      case 'right':
        applyFormat('justifyRight');
        break;
      case 'justify':
        applyFormat('justifyFull');
        break;
    }
  };

  const insertList = (type: ListType) => {
    setListType(type);
    if (type === 'bullet') {
      applyFormat('insertUnorderedList');
    } else if (type === 'number') {
      applyFormat('insertOrderedList');
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormat('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      applyFormat('insertImage', url);
    }
  };

  const clearFormatting = () => {
    applyFormat('removeFormat');
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setStrikethrough(false);
  };

  const handleExport = (format: 'html' | 'docx' | 'pdf') => {
    const exportContent = editorRef.current?.innerHTML || '';

    if (format === 'html') {
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${fileName}</title>
  <style>
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      max-width: 8.5in;
      margin: 1in auto;
      padding: 20px;
      background: white;
    }
  </style>
</head>
<body>
  ${exportContent}
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');

    if (rows && cols) {
      let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHtml += '<td style="padding: 8px; border: 1px solid #ddd;">&nbsp;</td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table>';

      applyFormat('insertHTML', tableHtml);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Toolbar */}
      <div style={{
        backgroundColor: '#2b579a',
        color: 'white',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e4276',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back
          </button>
          <span style={{ fontSize: '18px', fontWeight: 500 }}>
            {fileName} {hasUnsavedChanges && '*'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              backgroundColor: hasUnsavedChanges ? '#107c10' : '#1e4276',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            💾 Save
          </button>
          <button
            onClick={() => handleExport('html')}
            style={{
              padding: '8px 20px',
              backgroundColor: '#1e4276',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ⬇ Export
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div style={{
        backgroundColor: '#f3f2f1',
        borderBottom: '1px solid #d1d1d1',
        padding: '8px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Font Family */}
        <select
          value={fontFamily}
          onChange={(e) => changeFontFamily(e.target.value)}
          style={{
            padding: '6px 8px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
        </select>

        {/* Font Size */}
        <select
          value={fontSize}
          onChange={(e) => changeFontSize(Number(e.target.value))}
          style={{
            padding: '6px 8px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '70px'
          }}
        >
          {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1' }} />

        {/* Text Formatting */}
        <button
          onClick={toggleBold}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: bold ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          title="Bold"
        >
          B
        </button>

        <button
          onClick={toggleItalic}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: italic ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            fontStyle: 'italic',
            fontSize: '16px'
          }}
          title="Italic"
        >
          I
        </button>

        <button
          onClick={toggleUnderline}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: underline ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '16px'
          }}
          title="Underline"
        >
          U
        </button>

        <button
          onClick={toggleStrikethrough}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: strikethrough ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            textDecoration: 'line-through',
            fontSize: '16px'
          }}
          title="Strikethrough"
        >
          S
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1' }} />

        {/* Text Color */}
        <input
          type="color"
          value={textColor}
          onChange={(e) => changeTextColor(e.target.value)}
          style={{
            width: '40px',
            height: '32px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Text Color"
        />

        {/* Background Color */}
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => changeBackgroundColor(e.target.value)}
          style={{
            width: '40px',
            height: '32px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Highlight Color"
        />

        <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1' }} />

        {/* Alignment */}
        <button
          onClick={() => changeAlignment('left')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: alignment === 'left' ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Align Left"
        >
          ≡
        </button>

        <button
          onClick={() => changeAlignment('center')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: alignment === 'center' ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Align Center"
        >
          ≣
        </button>

        <button
          onClick={() => changeAlignment('right')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: alignment === 'right' ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Align Right"
        >
          ≡
        </button>

        <button
          onClick={() => changeAlignment('justify')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: alignment === 'justify' ? '#e1dfdd' : 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Justify"
        >
          ≣
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1' }} />

        {/* Lists */}
        <button
          onClick={() => insertList('bullet')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Bullet List"
        >
          •
        </button>

        <button
          onClick={() => insertList('number')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Numbered List"
        >
          1.
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1' }} />

        {/* Insert */}
        <button
          onClick={insertLink}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="Insert Link"
        >
          🔗
        </button>

        <button
          onClick={insertImage}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="Insert Image"
        >
          🖼
        </button>

        <button
          onClick={insertTable}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="Insert Table"
        >
          ⊞
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1' }} />

        <button
          onClick={clearFormatting}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="Clear Formatting"
        >
          ✕
        </button>
      </div>

      {/* Editor Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#e5e5e5',
        padding: '40px 20px'
      }}>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{
            minHeight: '11in',
            width: '8.5in',
            margin: '0 auto',
            padding: '1in',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
            lineHeight: 1.6,
            outline: 'none'
          }}
          suppressContentEditableWarning
        >
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 20px',
        backgroundColor: '#2b579a',
        color: 'white',
        fontSize: '13px'
      }}>
        <span>Words: {wordCount}</span>
        <span>Pages: {pageCount}</span>
        <span>Characters: {editorRef.current?.innerText.length || 0}</span>
      </div>
    </div>
  );
};

export default WordProcessor;
