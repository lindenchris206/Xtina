import React, { useState, useRef, useEffect } from 'react';

interface TextEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onClose?: () => void;
  fileName?: string;
}

type TextStyle = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
};

export const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = '',
  onSave,
  onClose,
  fileName = 'Untitled'
}) => {
  const [content, setContent] = useState(initialContent);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('monospace');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(content.length);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setHasUnsavedChanges(false);
    }
  };

  const handleExport = (format: 'txt' | 'md' | 'html') => {
    let exportContent = content;
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'html') {
      exportContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${fileName}</title>
  <style>
    body { font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; padding: 20px; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <pre>${content}</pre>
</body>
</html>`;
      mimeType = 'text/html';
      extension = 'html';
    } else if (format === 'md') {
      extension = 'md';
      mimeType = 'text/markdown';
    }

    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFind = () => {
    if (searchTerm && textAreaRef.current) {
      const text = textAreaRef.current.value;
      const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
      if (index !== -1) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(index, index + searchTerm.length);
      }
    }
  };

  const handleReplace = (replaceWith: string) => {
    if (searchTerm && textAreaRef.current) {
      const text = textAreaRef.current.value;
      const newText = text.replace(new RegExp(searchTerm, 'gi'), replaceWith);
      setContent(newText);
      setHasUnsavedChanges(true);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setContent('');
      setHasUnsavedChanges(true);
    }
  };

  const insertTemplate = (template: string) => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + template + content.substring(end);
      setContent(newContent);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #3e3e42',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3e3e42',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>

          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            {fileName} {hasUnsavedChanges && '*'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: hasUnsavedChanges ? '#0e639c' : '#3e3e42',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Save
          </button>

          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3e3e42',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Find
          </button>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{
              padding: '8px',
              backgroundColor: '#3e3e42',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer'
            }}
          >
            <option value={10}>10px</option>
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
          </select>

          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{
              padding: '8px',
              backgroundColor: '#3e3e42',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer'
            }}
          >
            <option value="monospace">Monospace</option>
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="'Courier New'">Courier New</option>
            <option value="'Arial'">Arial</option>
          </select>

          <div style={{ position: 'relative' }}>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#3e3e42',
                border: 'none',
                borderRadius: '4px',
                color: '#d4d4d4',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Export ▼
            </button>
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#252526',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              display: 'none',
              zIndex: 1000
            }}
            onMouseEnter={(e) => e.currentTarget.style.display = 'block'}
            >
              <button onClick={() => handleExport('txt')} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: '#d4d4d4', cursor: 'pointer', textAlign: 'left' }}>
                Text (.txt)
              </button>
              <button onClick={() => handleExport('md')} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: '#d4d4d4', cursor: 'pointer', textAlign: 'left' }}>
                Markdown (.md)
              </button>
              <button onClick={() => handleExport('html')} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: '#d4d4d4', cursor: 'pointer', textAlign: 'left' }}>
                HTML (.html)
              </button>
            </div>
          </div>

          <button
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3e3e42',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#252526',
          borderBottom: '1px solid #3e3e42',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Find..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#3e3e42',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              color: '#d4d4d4'
            }}
          />
          <button
            onClick={handleFind}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0e639c',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer'
            }}
          >
            Find
          </button>
          <button
            onClick={() => setShowSearch(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3e3e42',
              border: 'none',
              borderRadius: '4px',
              color: '#d4d4d4',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Editor Area */}
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={handleContentChange}
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#1e1e1e',
          border: 'none',
          color: '#d4d4d4',
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          lineHeight: lineHeight,
          resize: 'none',
          outline: 'none'
        }}
        placeholder="Start typing..."
      />

      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 20px',
        backgroundColor: '#007acc',
        color: '#ffffff',
        fontSize: '12px'
      }}>
        <span>Lines: {content.split('\n').length}</span>
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
        <span>{fontFamily} | {fontSize}px</span>
      </div>
    </div>
  );
};

export default TextEditor;
