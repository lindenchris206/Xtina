// frontend/src/LeftSidebar/AgentsPanel.jsx
import React from 'react';

export default function AgentsPanel({ agents }) {
  return (
    <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '10px', marginBottom: '10px' }}>
      <h3 style={{ color: '#ff69b4' }}>Agents</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {agents.map(agent => (
          <li key={agent.name} style={{ padding: '6px 0', color: '#e0e0e0' }}>
            {agent.name} - {agent.specialties.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
