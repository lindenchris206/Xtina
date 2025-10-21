
/**
 * @author cel
 * @file components/Terminal.tsx
 * @description Renders a simulated command-line terminal.
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMission } from '../context/MissionContext';
import { AstraLogoASCII } from './icons';

interface HistoryItem {
    command: string;
    output: React.ReactNode;
}

const buildFileTree = (files: { filename: string }[]) => {
    const tree: any = {};
    files.forEach(file => {
        let currentLevel = tree;
        const parts = file.filename.split('/');
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                currentLevel[part] = null; // file
            } else {
                if (!currentLevel[part]) {
                    currentLevel[part] = {}; // directory
                }
                currentLevel = currentLevel[part];
            }
        });
    });
    return tree;
};

const formatTree = (node: any, prefix = ''): string => {
    let result = '';
    const entries = Object.entries(node);
    entries.forEach(([key, value], index) => {
        const isLast = index === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        result += `${prefix}${connector}${key}\n`;
        if (value !== null) { // It's a directory
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            result += formatTree(value, newPrefix);
        }
    });
    return result;
};


export const Terminal: React.FC = () => {
    const { appState, addSpecialCommand, setActiveFile, commitChanges, installPackage } = useMission();
    const { generatedFiles, commitHistory } = appState;
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [showWelcome, setShowWelcome] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const availableCommands = useMemo(() => ['help', 'ls', 'cat', 'edit', 'tree', 'git', 'npm', 'deploy', 'clear'], []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, showWelcome]);

    useEffect(() => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        const parts = input.split(' ');
        const currentArg = parts[parts.length - 1];
        let newSuggestions: string[] = [];

        if (parts.length === 1) {
            newSuggestions = availableCommands.filter(cmd => cmd.startsWith(currentArg));
        } else {
            const command = parts[0];
            if (['cat', 'edit'].includes(command)) {
                newSuggestions = generatedFiles
                    .map(f => f.filename)
                    .filter(name => name.startsWith(currentArg));
            } else if (command === 'git' && parts.length === 2) {
                newSuggestions = ['status', 'commit', 'log', 'diff'].filter(sub => sub.startsWith(parts[1]));
            }
        }
        setSuggestions(newSuggestions);
        setActiveSuggestion(0);
    }, [input, availableCommands, generatedFiles]);

    const executeCommand = async (cmd: string) => {
        const [command, ...args] = cmd.trim().split(' ');
        let output: React.ReactNode = `astraOS: command not found: ${command}`;

        const addHistory = (out: React.ReactNode) => {
             setHistory(prev => [...prev, { command: cmd, output: out }]);
        }

        switch (command) {
            case 'help':
                output = (
                    <div className="text-gray-300">
                        <p className="font-bold text-[rgb(var(--color-primary-accent))]">AstraOS Terminal Help</p>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li><span className="font-bold">ls</span> - List all project files.</li>
                            <li><span className="font-bold">cat &lt;filename&gt;</span> - Display file content.</li>
                            <li><span className="font-bold">edit &lt;filename&gt;</span> - Open a file in the editor.</li>
                            <li><span className="font-bold">tree</span> - Display file structure as a tree.</li>
                            <li><span className="font-bold">git &lt;status|commit|log|diff&gt;</span> - Version control.</li>
                            <li><span className="font-bold">npm install &lt;pkg&gt;</span> - Simulate installing a package.</li>
                            <li><span className="font-bold">deploy</span> - Start the project deployment pipeline.</li>
                            <li><span className="font-bold">clear</span> - Clear the terminal screen.</li>
                        </ul>
                    </div>
                );
                break;
            case 'ls':
                output = generatedFiles.length > 0
                    ? generatedFiles.map(f => f.filename).join('\n')
                    : 'No files in the project.';
                break;
            case 'cat':
                const catFile = generatedFiles.find(f => f.filename === args[0]);
                output = catFile ? catFile.content : `Error: file not found: ${args[0]}`;
                break;
            case 'edit':
                const fileToEdit = generatedFiles.find(f => f.filename === args[0]);
                if (fileToEdit) {
                    setActiveFile(fileToEdit);
                    output = `Opening ${args[0]} in the editor...`;
                } else {
                    output = `Error: file not found: ${args[0]}`;
                }
                break;
            case 'tree':
                const fileTree = buildFileTree(generatedFiles);
                output = generatedFiles.length > 0 ? formatTree(fileTree) : 'Project is empty.';
                break;
            case 'git':
                if (args[0] === 'status') {
                    output = `On branch main. Changes to be committed:\n${generatedFiles.map(f => `  <span class="text-green-400">new file:   ${f.filename}</span>`).join('\n')}`;
                } else if (args[0] === 'commit') {
                    const commitMsg = cmd.match(/-m "(.*?)"/)?.[1] || '';
                    addHistory(`Committing changes...`);
                    const finalMessage = await commitChanges(commitMsg);
                    output = `[main ${Math.random().toString(36).substring(2, 9)}] ${finalMessage}\n ${generatedFiles.length} files changed.`;
                } else if (args[0] === 'log') {
                    output = commitHistory.length > 0 
                        ? commitHistory.map(c => `commit <span class="text-yellow-400">${c.id}</span>\nAuthor: cel\nDate:   ${new Date(c.timestamp).toUTCString()}\n\n\t${c.message}`).join('\n\n')
                        : 'No commits yet.';
                } else if (args[0] === 'diff') {
                    const lastCommit = commitHistory[0];
                    if (!lastCommit) {
                        output = 'No previous commit to compare against.';
                    } else {
                         output = `Simulating diff since commit ${lastCommit.id}...\n` +
                                  generatedFiles
                                    .filter(f => !lastCommit.files.includes(f.filename))
                                    .map(f => `<span class="text-green-400">+ new file: ${f.filename}</span>`)
                                    .join('\n');
                    }
                } else {
                    output = `Unknown git command: ${args[0]}`;
                }
                break;
            case 'npm':
                if(args[0] === 'install' && args[1]) {
                    addHistory(`Simulating installation of package: ${args[1]}...`);
                    const result = await installPackage(args[1]);
                    output = result;
                } else {
                    output = `Usage: npm install <package_name>`;
                }
                break;
            case 'deploy':
                addSpecialCommand({ type: 'DEPLOY_PROJECT', issuedBy: 'user' });
                output = 'Deployment pipeline initiated... Aquila is on it.';
                break;
            case 'clear':
                setHistory([]);
                setShowWelcome(true);
                return;
            case '':
                output = '';
                break;
        }

        if (typeof output === 'string') {
            output = <span dangerouslySetInnerHTML={{ __html: output }} />;
        }
        addHistory(output);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (showWelcome) setShowWelcome(false);
        
        if (currentInput) {
            setCommandHistory(prev => [currentInput, ...prev].slice(0, 50));
            await executeCommand(currentInput);
        } else {
            setHistory(prev => [...prev, { command: '', output: '' }]);
        }
        setInput('');
        setHistoryIndex(-1); // Reset index for new command
        setSuggestions([]);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (suggestions.length > 0) {
                const currentSuggestion = suggestions[activeSuggestion];
                const parts = input.split(' ');
                parts[parts.length - 1] = currentSuggestion;
                setInput(parts.join(' ') + ' ');
                setSuggestions([]);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (suggestions.length > 0) {
                setActiveSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (commandHistory.length > 0) {
                const newIndex = historyIndex === -1 ? 0 : Math.min(commandHistory.length - 1, historyIndex + 1);
                setInput(commandHistory[newIndex] || '');
                setHistoryIndex(newIndex);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (suggestions.length > 0) {
                setActiveSuggestion(prev => (prev + 1) % suggestions.length);
            } else if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setInput(commandHistory[newIndex] || '');
                setHistoryIndex(newIndex);
            } else {
                setInput('');
                setHistoryIndex(-1);
            }
        }
    };
    
    const welcomeMessage = (
        <div className="flex gap-4 items-center">
            <div className="text-[rgb(var(--color-primary-accent))] text-[10px] leading-tight flex-shrink-0">
                <AstraLogoASCII />
            </div>
            <div>
                <p className="font-bold text-lg">AstraOS v2.1</p>
                <p>Welcome back, cel.</p>
                <br />
                <p><span className="font-bold">OS:</span> Astra Virtualized Kernel</p>
                <p><span className="font-bold">Uptime:</span> {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</p>
                <p><span className="font-bold">Shell:</span> astra-sh</p>
                <p><span className="font-bold">CPU:</span> Quantum Core @ 9.8GHz (Simulated)</p>
                <br/>
                <p>Type '<span className="text-[rgb(var(--color-primary-accent))]">help</span>' for a list of commands.</p>
            </div>
        </div>
    );

    return (
        <div 
            className="terminal bg-gray-900/80 text-gray-300 h-full flex flex-col p-2"
            onClick={() => inputRef.current?.focus()}
        >
            <div ref={scrollRef} className="flex-grow overflow-y-auto scrollbar-thin">
                <div className="p-2">
                    {showWelcome && welcomeMessage}
                    {history.map((item, index) => (
                        <div key={index}>
                            <div className="flex items-center">
                                <span className="text-[rgb(var(--color-primary-accent))]">cel@astra:~$</span>
                                <span className="ml-2">{item.command}</span>
                            </div>
                            <div className="whitespace-pre-wrap leading-tight mt-1 mb-2">{item.output}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0 relative">
                <form onSubmit={handleSubmit} className="flex items-center mt-2">
                    <span className="text-[rgb(var(--color-primary-accent))]">cel@astra:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-grow bg-transparent focus:outline-none ml-2"
                        autoFocus
                        spellCheck="false"
                        autoComplete="off"
                    />
                    <div className="terminal-cursor" />
                </form>
                 {suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-1 bg-gray-800 border border-white/20 rounded-md p-1 text-xs">
                        {suggestions.map((s, i) => (
                            <div key={s} className={`px-2 py-1 ${i === activeSuggestion ? 'bg-[rgba(var(--color-primary-accent),0.3)]' : ''}`}>{s}</div>
                        ))}
                    </div>
                 )}
            </div>
        </div>
    );
};
