// frontend/src/GlobalSearchBar.jsx
import React, { useState } from 'react';

export default function GlobalSearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) onSearch(query);
  };

  return (
    <div style={{ padding: '8px', background: '#2a2a2a', display: 'flex', gap: '8px' }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search help or tasks..."
        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#1e1e1e', color: '#e0e0e0' }}
      />
      <button
        onClick={handleSearch}
        style={{ background: '#ff69b4', color: '#1e1e1e', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
      >
        Search
      </button>
    </div>
  );
}
