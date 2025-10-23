import React from 'react';
import type { GeneratedFile, CrewMember } from '../types';
import { SearchIcon, FileIcon, XIcon } from './icons';

interface SearchResult {
    type: 'file' | 'crew';
    item: GeneratedFile | CrewMember;
}

interface GlobalSearchBarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    results: SearchResult[];
    onResultClick: (result: SearchResult) => void;
    onClear: () => void;
    isFocused: boolean;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
    searchQuery,
    onSearchQueryChange,
    results,
    onResultClick,
    onClear,
    isFocused,
}) => {
    const fileResults = results.filter(r => r.type === 'file');
    const crewResults = results.filter(r => r.type === 'crew');

    return (
        <div className="relative flex-grow max-w-lg">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="w-5 h-5 text-gray-400"><SearchIcon /></span>
                </span>
                <input
                    type="text"
                    placeholder="Search files, crew members..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    className="w-full bg-gray-900/50 border border-white/20 rounded-md pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
                {searchQuery && (
                    <button onClick={onClear} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white">
                        <span className="w-5 h-5"><XIcon/></span>
                    </button>
                )}
            </div>

            {isFocused && searchQuery && (
                <div className="absolute top-full mt-2 w-full glassmorphism rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto scrollbar-thin">
                    {results.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">No results found.</div>
                    ) : (
                        <div className="p-2">
                            {fileResults.length > 0 && (
                                <>
                                    <h4 className="px-2 py-1 text-xs font-bold text-indigo-300">Files</h4>
                                    {fileResults.map(({ item }) => (
                                        <button key={(item as GeneratedFile).filename} onClick={() => onResultClick({ type: 'file', item })} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-indigo-500/50">
                                            <span className="w-5 h-5 text-cyan-400 flex-shrink-0"><FileIcon/></span>
                                            <span className="text-sm truncate">{(item as GeneratedFile).filename}</span>
                                        </button>
                                    ))}
                                </>
                            )}
                            {crewResults.length > 0 && (
                                <>
                                    <h4 className="px-2 py-1 mt-2 text-xs font-bold text-indigo-300 border-t border-white/10 pt-2">Crew</h4>
                                    {crewResults.map(({ item }) => (
                                        <button key={(item as CrewMember).name} onClick={() => onResultClick({ type: 'crew', item })} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-indigo-500/50">
                                            <span className="w-6 h-6 text-cyan-400 flex-shrink-0">{(item as CrewMember).icon}</span>
                                            <div>
                                                <p className="text-sm font-semibold truncate">{(item as CrewMember).name}</p>
                                                <p className="text-xs text-gray-400 truncate">{(item as CrewMember).specialty}</p>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
