// frontend/src/LeftSidebar/MediaPanel.jsx
import React from 'react';

export default function MediaPanel({ mediaFiles }) {
  return (
    <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '10px', marginBottom: '10px' }}>
      <h3 style={{ color: '#ff69b4' }}>Media</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mediaFiles.map(file => (
          <li key={file.name} style={{ padding: '6px 0', color: '#e0e0e0' }}>
            {file.name} ({file.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
