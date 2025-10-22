import React, { useState, useRef, useEffect } from 'react';

interface PdfViewerProps {
  file?: File | string;
  onClose?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ file, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file) {
      setLoading(true);
      setError('');

      if (typeof file === 'string') {
        setPdfUrl(file);
      } else {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [file]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = typeof file === 'string' ? 'document.pdf' : file?.name || 'document.pdf';
      link.click();
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
    }
  };

  return (
    <div className="pdf-viewer-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#525659'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#323639',
        borderBottom: '1px solid #424548',
        color: '#e8eaed'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#5f6368',
              border: 'none',
              borderRadius: '4px',
              color: '#e8eaed',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage === 1 ? '#424548' : '#5f6368',
                border: 'none',
                borderRadius: '4px',
                color: currentPage === 1 ? '#9aa0a6' : '#e8eaed',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '14px', minWidth: '100px', textAlign: 'center' }}>
              Page {currentPage} of {totalPages || '?'}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage === totalPages || totalPages === 0 ? '#424548' : '#5f6368',
                border: 'none',
                borderRadius: '4px',
                color: currentPage === totalPages || totalPages === 0 ? '#9aa0a6' : '#e8eaed',
                cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleZoomOut}
            style={{
              padding: '6px 12px',
              backgroundColor: '#5f6368',
              border: 'none',
              borderRadius: '4px',
              color: '#e8eaed',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            −
          </button>
          <span style={{ fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            style={{
              padding: '6px 12px',
              backgroundColor: '#5f6368',
              border: 'none',
              borderRadius: '4px',
              color: '#e8eaed',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            +
          </button>

          <button
            onClick={handleDownload}
            style={{
              padding: '8px 16px',
              backgroundColor: '#5f6368',
              border: 'none',
              borderRadius: '4px',
              color: '#e8eaed',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: '8px'
            }}
          >
            Download
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '8px 16px',
              backgroundColor: '#5f6368',
              border: 'none',
              borderRadius: '4px',
              color: '#e8eaed',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Print
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px'
      }}>
        {loading && (
          <div style={{ color: '#e8eaed', fontSize: '16px', marginTop: '50px' }}>
            Loading PDF...
          </div>
        )}

        {error && (
          <div style={{ color: '#f28b82', fontSize: '16px', marginTop: '50px' }}>
            Error: {error}
          </div>
        )}

        {pdfUrl && !error && (
          <iframe
            src={pdfUrl}
            style={{
              width: `${scale * 100}%`,
              height: `${scale * 150}vh`,
              border: 'none',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
            title="PDF Viewer"
          />
        )}

        {!file && !loading && (
          <div style={{
            textAlign: 'center',
            color: '#9aa0a6',
            marginTop: '50px',
            fontSize: '16px'
          }}>
            <p>No PDF file loaded</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Please select a PDF file to view
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
