import React, { useState, useEffect } from 'react';
import type { GeneratedFile } from '../../types';
import { CopyIcon, SaveIcon, CheckIcon, SparklesIcon, XIcon, LoadingIcon, FileTextIcon, GithubIcon } from '../icons';
import { useMission } from '../../context/MissionContext';
import * as geminiService from '../../services/geminiService';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

const RefactorModal: React.FC<{
    originalCode: string;
    refactoredCode: string;
    onAccept: () => void;
    onClose: () => void;
}> = ({ originalCode, refactoredCode, onAccept, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[80vh] bg-gray-800 rounded-xl border border-white/20 flex flex-col glassmorphism">
                 <div className="flex justify-between items-center p-3 border-b border-white/10 flex-shrink-0">
                    <h3 className="text-lg font-orbitron text-indigo-300 flex items-center gap-2"><SparklesIcon/> Ethan's Refactoring Suggestions</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                </div>
                <div className="flex-grow grid grid-cols-2 gap-px bg-white/10 overflow-hidden">
                    <div className="flex flex-col bg-gray-800">
                        <h4 className="p-2 font-semibold text-sm bg-gray-900/50">Original Code</h4>
                        <pre className="p-2 text-xs overflow-auto scrollbar-thin flex-grow"><code>{originalCode}</code></pre>
                    </div>
                    <div className="flex flex-col bg-gray-800">
                        <h4 className="p-2 font-semibold text-sm bg-gray-900/50 text-cyan-300">Refactored Code</h4>
                        <pre className="p-2 text-xs overflow-auto scrollbar-thin flex-grow"><code>{refactoredCode}</code></pre>
                    </div>
                </div>
                <div className="p-3 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Reject</button>
                    <button onClick={onAccept} className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md">Accept & Save</button>
                </div>
            </div>
        </div>
    )
}

interface TextEditorProps {
    file: GeneratedFile;
    onSave: (filename: string, content: string) => void;
}

const mapLanguageToPrism = (lang?: string): string => {
    const mapping: Record<string, string> = {
        typescript: 'ts',
        javascript: 'js',
        html: 'markup',
        markdown: 'md',
        python: 'py',
        shell: 'bash',
    };
    return mapping[lang || ''] || lang || 'clike';
};

export const TextEditor: React.FC<TextEditorProps> = ({ file, onSave }) => {
    const [content, setContent] = useState(file.content);
    const [isDirty, setIsDirty] = useState(false);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const [isRefactoring, setIsRefactoring] = useState(false);
    const [refactoredContent, setRefactoredContent] = useState<string | null>(null);
    const { getRefactoredCode, addSpecialCommand, injectTask } = useMission();

    useEffect(() => {
        setContent(file.content);
        setIsDirty(false);
    }, [file]);

    const handleSave = () => {
        onSave(file.filename, content);
        setIsDirty(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    };

    const handleChange = (newContent: string) => {
        setContent(newContent);
        setIsDirty(true);
    };
    
    const handleRefactor = async () => {
        setIsRefactoring(true);
        const suggestion = await getRefactoredCode(content, file.language);
        setRefactoredContent(suggestion);
        setIsRefactoring(false);
    }

    const acceptRefactor = () => {
        if(refactoredContent) {
            setContent(refactoredContent);
            onSave(file.filename, refactoredContent);
        }
        setRefactoredContent(null);
    }
    
    const handleGenerateTests = () => addSpecialCommand({ type: 'GENERATE_TESTS', issuedBy: 'user', payload: file });
    const handleReviewCode = () => addSpecialCommand({ type: 'REVIEW_CODE', issuedBy: 'user', payload: file });
    
    const handleGenerateDocs = () => {
        injectTask({
            member: 'Isabella',
            task: `Generate comprehensive documentation (e.g., JSDoc, TSDoc) for the code in the file '${file.filename}'. The output should be the full updated file content, including the new documentation.`,
            priority: 2,
            dependencies: [],
        });
    };

    const handleGenerateCommit = async () => {
        const message = await geminiService.generateCommitMessage([file]);
        alert(`Suggested Commit Message:\n\n${message}`);
    };

    const highlight = (code: string) => {
        const lang = mapLanguageToPrism(file.language);
        const grammar = Prism.languages[lang];
        if (grammar) {
            return Prism.highlight(code, grammar, lang);
        }
        return code;
    };

    return (
        <div className="flex-grow flex flex-col h-full">
            <div className="p-2 border-b border-white/10 flex justify-between items-center text-sm flex-shrink-0 flex-wrap gap-2">
                <p className="font-medium text-cyan-300">{file.filename}</p>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                        {copyStatus === 'copied' ? <CheckIcon/> : <CopyIcon />}
                    </button>
                    <button onClick={handleSave} disabled={!isDirty} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <SaveIcon /> {isDirty ? 'Save' : 'Saved'}
                    </button>
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                     <button onClick={handleGenerateDocs} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-purple-700 hover:bg-purple-600 rounded-md transition-colors" title="Generate Documentation"><FileTextIcon/> Docs</button>
                     <button onClick={handleGenerateTests} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-green-700 hover:bg-green-600 rounded-md transition-colors" title="Generate Tests"><FileTextIcon/> Tests</button>
                     <button onClick={handleGenerateCommit} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors" title="Generate Commit Message"><GithubIcon /> Commit</button>
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    <button onClick={handleReviewCode} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors" title="Request Code Review"><SparklesIcon/> Review</button>
                    <button onClick={handleRefactor} disabled={isRefactoring} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:bg-gray-600" title="Refactor Code">
                        {isRefactoring ? <LoadingIcon/> : <SparklesIcon />} Refactor
                    </button>
                </div>
            </div>
            <div className="flex-grow w-full h-full resize-none focus:outline-none scrollbar-thin overflow-auto language-ts"
                 style={{ backgroundColor: '#272822' }}>
                <Editor
                    value={content}
                    onValue-change={handleChange}
                    highlight={highlight}
                    padding={10}
                    textareaClassName="focus:outline-none"
                    style={{
                        fontFamily: '"Source Code Pro", "Fira Mono", monospace',
                        fontSize: 14,
                        lineHeight: 1.5,
                        caretColor: 'white',
                    }}
                />
            </div>
            {refactoredContent && (
                <RefactorModal 
                    originalCode={content}
                    refactoredCode={refactoredContent}
                    onAccept={acceptRefactor}
                    onClose={() => setRefactoredContent(null)}
                />
            )}
        </div>
    );
};