// frontend/src/LeftSidebar/TasksPanel.jsx
import React from 'react';

export default function TasksPanel({ tasks }) {
  return (
    <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '10px', marginBottom: '10px' }}>
      <h3 style={{ color: '#ff69b4' }}>Tasks</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ padding: '6px 0', color: '#e0e0e0' }}>
            {task.title} ({task.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
