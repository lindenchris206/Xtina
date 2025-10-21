import React from 'react';

interface EditorPlaceholderProps {
  type: string;
  message?: string;
}

const EditorPlaceholder: React.FC<EditorPlaceholderProps> = ({ type, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
      <h2 className="text-xl font-bold text-gray-600">{type}</h2>
      <p className="mt-2 text-sm">{message || 'This feature is currently under development.'}</p>
    </div>
  );
};

export default EditorPlaceholder;
