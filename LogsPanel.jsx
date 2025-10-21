// frontend/src/LeftSidebar/LogsPanel.jsx
import React from 'react';

export default function LogsPanel({ logs }) {
  return (
    <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '10px', marginBottom: '10px', maxHeight: '200px', overflowY: 'auto' }}>
      <h3 style={{ color: '#ff69b4' }}>Logs</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log, idx) => (
          <li key={idx} style={{ color: '#e0e0e0', fontSize: '12px', padding: '2px 0' }}>
            {log}
          </li>
        ))}
      </ul>
    </div>
  );
}
