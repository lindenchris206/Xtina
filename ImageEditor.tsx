import React, { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  src?: string | File;
  onSave?: (imageData: string) => void;
  onClose?: () => void;
}

type Tool = 'select' | 'crop' | 'draw' | 'text' | 'filter' | 'rotate' | 'resize';
type Filter = 'none' | 'grayscale' | 'sepia' | 'brightness' | 'contrast' | 'blur' | 'invert';

export const ImageEditor: React.FC<ImageEditorProps> = ({
  src,
  onSave,
  onClose
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>('none');
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [drawSize, setDrawSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (src) {
      if (typeof src === 'string') {
        setImageSrc(src);
      } else {
        const url = URL.createObjectURL(src);
        setImageSrc(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [src]);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        applyFilters();
      };
      img.src = imageSrc;
      imageRef.current = img;
    }
  }, [imageSrc]);

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturation, blur, rotation, flipHorizontal, flipVertical, selectedFilter]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      flipHorizontal ? -1 : 1,
      flipVertical ? -1 : 1
    );
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply filters
    let filterString = '';
    filterString += `brightness(${brightness}%) `;
    filterString += `contrast(${contrast}%) `;
    filterString += `saturate(${saturation}%) `;
    filterString += `blur(${blur}px) `;

    if (selectedFilter === 'grayscale') {
      filterString += 'grayscale(100%) ';
    } else if (selectedFilter === 'sepia') {
      filterString += 'sepia(100%) ';
    } else if (selectedFilter === 'invert') {
      filterString += 'invert(100%) ';
    }

    ctx.filter = filterString;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Restore context
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'draw') {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawSize;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasUnsavedChanges(true);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    if (onSave) {
      onSave(imageData);
      setHasUnsavedChanges(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setSelectedFilter('none');
    setScale(1);
    setHasUnsavedChanges(false);
    applyFilters();
  };

  const rotateImage = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
    setHasUnsavedChanges(true);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal(!flipHorizontal);
    setHasUnsavedChanges(true);
  };

  const handleFlipVertical = () => {
    setFlipVertical(!flipVertical);
    setHasUnsavedChanges(true);
  };

  const applyFilter = (filter: Filter) => {
    setSelectedFilter(filter);
    setHasUnsavedChanges(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#2d2d2d'
    }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#1e1e1e',
        borderBottom: '1px solid #3d3d3d',
        color: '#e0e0e0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>

          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            Image Editor {hasUnsavedChanges && '*'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reset
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: hasUnsavedChanges ? '#0e639c' : '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: hasUnsavedChanges ? 600 : 400
            }}
          >
            Save
          </button>

          <button
            onClick={handleDownload}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0e639c',
              border: 'none',
              borderRadius: '4px',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Download
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Tools */}
        <div style={{
          width: '280px',
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #3d3d3d',
          padding: '20px',
          overflowY: 'auto',
          color: '#e0e0e0'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>Tools</h3>

          {/* Tool Selection */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {(['select', 'crop', 'draw', 'text', 'filter', 'rotate'] as Tool[]).map(tool => (
                <button
                  key={tool}
                  onClick={() => setCurrentTool(tool)}
                  style={{
                    padding: '10px',
                    backgroundColor: currentTool === tool ? '#0e639c' : '#3d3d3d',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textTransform: 'capitalize'
                  }}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Adjustments */}
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Adjustments</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
              Brightness: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => {
                setBrightness(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
              Contrast: {contrast}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => {
                setContrast(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
              Saturation: {saturation}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => {
                setSaturation(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
              Blur: {blur}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={blur}
              onChange={(e) => {
                setBlur(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Filters */}
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '24px' }}>
            {(['none', 'grayscale', 'sepia', 'invert'] as Filter[]).map(filter => (
              <button
                key={filter}
                onClick={() => applyFilter(filter)}
                style={{
                  padding: '8px',
                  backgroundColor: selectedFilter === filter ? '#0e639c' : '#3d3d3d',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Transform */}
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Transform</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
              Rotation: {rotation}°
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => rotateImage(-90)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#3d3d3d',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ↶ 90°
              </button>
              <button
                onClick={() => rotateImage(90)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#3d3d3d',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ↷ 90°
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={handleFlipHorizontal}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: flipHorizontal ? '#0e639c' : '#3d3d3d',
                border: 'none',
                borderRadius: '4px',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Flip H
            </button>
            <button
              onClick={handleFlipVertical}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: flipVertical ? '#0e639c' : '#3d3d3d',
                border: 'none',
                borderRadius: '4px',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Flip V
            </button>
          </div>

          {/* Draw Settings */}
          {currentTool === 'draw' && (
            <>
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Draw Settings</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                  Color
                </label>
                <input
                  type="color"
                  value={drawColor}
                  onChange={(e) => setDrawColor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                  Brush Size: {drawSize}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={drawSize}
                  onChange={(e) => setDrawSize(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            padding: '20px',
            backgroundColor: '#2d2d2d'
          }}
        >
          {imageSrc ? (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                cursor: currentTool === 'draw' ? 'crosshair' : 'default',
                transform: `scale(${scale})`
              }}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#888',
              fontSize: '18px'
            }}>
              <p>No image loaded</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Please select an image to edit
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 20px',
        backgroundColor: '#1e1e1e',
        borderTop: '1px solid #3d3d3d',
        color: '#888',
        fontSize: '12px'
      }}>
        <span>Tool: {currentTool}</span>
        {canvasRef.current && (
          <span>
            Size: {canvasRef.current.width} × {canvasRef.current.height}px
          </span>
        )}
        <span>Zoom: {Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
};

export default ImageEditor;
