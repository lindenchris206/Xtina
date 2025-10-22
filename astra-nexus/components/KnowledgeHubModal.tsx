// Fix: This file's content was missing. A new functional component has been created to resolve compilation errors.
import React, { useState, useEffect } from 'react';
import { KnowledgeBundle, KnowledgeItem, ContentType } from '../types';
import { BookOpenIcon, XCircleIcon } from './IconComponents';
import ContentListItem from './ContentListItem';
import FileDropzone from './FileDropzone';

interface KnowledgeHubModalProps {
  bundle: KnowledgeBundle | null;
  onClose: () => void;
  onUpdateBundle: (updatedBundle: KnowledgeBundle) => void;
}

const KnowledgeHubModal: React.FC<KnowledgeHubModalProps> = ({ bundle, onClose, onUpdateBundle }) => {
  const [localBundle, setLocalBundle] = useState<KnowledgeBundle | null>(null);

  useEffect(() => {
    // Deep copy bundle to local state to avoid mutating original state
    if (bundle) {
      setLocalBundle(JSON.parse(JSON.stringify(bundle)));
    } else {
      setLocalBundle(null);
    }
  }, [bundle]);


  if (!localBundle) {
    return null;
  }

  const handleDeleteItem = (itemId: string) => {
    setLocalBundle(prev => {
      if (!prev) return null;
      const newContents = prev.contents.filter(item => item.id !== itemId);
      return { ...prev, contents: newContents, contentCount: newContents.length };
    });
  };
  
  const handleFilesAdded = (files: File[]) => {
    const newItems: KnowledgeItem[] = files.map((file, index) => {
      let type: ContentType;
      if (file.type === 'application/pdf') type = ContentType.PDF;
      else if (file.name.endsWith('.docx')) type = ContentType.DOCX;
      else if (file.name.endsWith('.md')) type = ContentType.MARKDOWN;
      else type = ContentType.TXT;

      return {
        id: `new-item-${Date.now()}-${index}`,
        name: file.name,
        type: type,
        source: 'local',
        added: new Date().toISOString().split('T')[0],
      };
    });

    setLocalBundle(prev => {
      if (!prev) return null;
      const newContents = [...prev.contents, ...newItems];
      return { ...prev, contents: newContents, contentCount: newContents.length };
    });
  };
  
  const handleSaveChanges = () => {
    if (localBundle) {
      onUpdateBundle(localBundle);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-xl border border-cyan-500/30 w-full max-w-3xl h-full max-h-[90vh] flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="font-orbitron text-xl font-bold text-cyan-300">{localBundle.name}</h2>
              <p className="text-sm text-slate-400">{localBundle.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-red-400 transition-colors">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          <h3 className="text-md font-bold text-slate-300">Contents ({localBundle.contentCount})</h3>
          <div className="space-y-1">
            {localBundle.contents.length > 0 ? (
              localBundle.contents.map(item => (
                <ContentListItem key={item.id} item={item} onDelete={handleDeleteItem} />
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No content in this bundle.</p>
            )}
          </div>
          <h3 className="text-md font-bold text-slate-300 pt-4 border-t border-cyan-500/10">Add New Content</h3>
          <FileDropzone onFilesAdded={handleFilesAdded} />
        </div>
        
        {/* Footer */}
        <div className="border-t border-cyan-500/20 pt-4 mt-4 flex justify-end gap-3 flex-shrink-0">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSaveChanges}
                className="px-4 py-2 rounded-md bg-cyan-600/80 text-white hover:bg-cyan-500/80 transition-colors"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubModal;
