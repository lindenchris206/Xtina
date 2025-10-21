// frontend/src/MainWorkspace/WorkflowCanvas.jsx
import React from 'react';

export default function WorkflowCanvas({ tasks }) {
  return (
    <div style={{
      background: '#252525',
      borderRadius: '12px',
      padding: '16px',
      minHeight: '400px',
      overflow: 'auto'
    }}>
      <h2 style={{ color: '#00cfff' }}>Workflow</h2>
      {tasks.map(task => (
        <div key={task.id} style={{
          padding: '8px',
          margin: '8px 0',
          background: '#333333',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
        }}>
          <strong>{task.title}</strong>
          <p style={{ color: '#aaaaaa' }}>{task.description}</p>
        </div>
      ))}
    </div>
  );
}
