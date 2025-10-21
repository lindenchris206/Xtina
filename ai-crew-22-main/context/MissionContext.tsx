import React, { createContext, useReducer, Dispatch, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import type { MissionState, Settings, MissionPlan, ProjectFile, MissionEvent, CrewMemberStatus, MissionDebrief, PrioritizedTask, GroundedSource, GitState, MissionAction, Email, EmailAccount, CommsState, EmailFolderName } from '../types';
import { CREW_MEMBERS } from '../constants';
import { generatePlan, executeTask, ExecutionResult, generateReadme } from '../services/geminiService';
import { updateFileInTree, downloadProjectAsZip } from '../utils/fileUtils';
import { selectCollaborators } from '../utils/crewUtils';
import { STATIC_PROJECT_FILES } from '../services/staticProjectFiles';
import { mockCommsState } from '../services/mockEmailData';

const createEvent = (
    type: MissionEvent['type'], 
    message: string, 
    agent?: string,
    sources?: GroundedSource[]
): MissionEvent => ({
    type,
    message,
    agent,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sources
});

const defaultSettings: Settings = {
    theme: 'astra',
    crewSize: 8,
    mode: 'deliberate',
    astraAvatar: 'Astra',
    crewConfig: CREW_MEMBERS,
    crewModelAssignments: {},
};

const initialGitState: GitState = {
    initialized: false,
    modified: [],
    staged: [],
    commits: [],
};

const initialState: MissionState = {
    settings: defaultSettings,
    missionObjective: '',
    missionStatus: 'idle',
    plan: null,
    missionDebrief: null,
    projectFiles: [],
    selectedFile: null,
    crewStatuses: {},
    missionEvents: [createEvent('info', 'Astra is online. Awaiting mission objective.')],
    totalComputeUnits: 0,
    currentTaskIndex: 0,
    failedTaskIndex: null,
    gitState: initialGitState,
    isAstraSpeaking: false,
    commsState: mockCommsState,
};


const missionReducer = (state: MissionState, action: MissionAction): MissionState => {
    switch (action.type) {
        case 'SET_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };
        case 'SET_MISSION_OBJECTIVE':
            return { ...state, missionObjective: action.payload };
        case 'START_PLANNING':
            return { ...state, missionStatus: 'planning', plan: null, missionEvents: [...state.missionEvents, createEvent('info', 'Planning initiated by Commander...')] };
        case 'PLANNING_COMPLETE':
            return { ...state, missionStatus: 'awaiting_approval', plan: action.payload, missionEvents: [...state.missionEvents, createEvent('success', 'Mission plan generated and is awaiting approval.')] };
        case 'PLANNING_FAILED':
            return { ...state, missionStatus: 'idle', missionEvents: [...state.missionEvents, createEvent('error', `Planning failed: ${action.payload}`)] };
        case 'APPROVE_PLAN':
            const initialStatuses: Record<string, CrewMemberStatus> = {};
            state.settings.crewConfig.slice(0, state.settings.crewSize).forEach(member => {
                initialStatuses[member.name] = { status: 'idle', progress: 0 };
            });
            return { ...state, missionStatus: 'executing', currentTaskIndex: 0, failedTaskIndex: null, crewStatuses: initialStatuses, missionEvents: [...state.missionEvents, createEvent('success', 'Plan approved. Mission execution commencing.')] };
        case 'PAUSE_MISSION':
            return { ...state, missionStatus: 'paused', missionEvents: [...state.missionEvents, createEvent('warning', 'Mission paused by Commander.')] };
        case 'RESUME_MISSION':
             return { ...state, missionStatus: 'executing', failedTaskIndex: null, missionEvents: [...state.missionEvents, createEvent('info', 'Mission resumed.')] };
        case 'ABORT_MISSION':
            return { ...initialState, settings: state.settings, missionObjective: state.missionObjective, missionEvents: [...state.missionEvents, createEvent('error', 'Mission aborted by Commander.')] };
        case 'MISSION_COMPLETE':
             const debrief: MissionDebrief = {
                projectName: state.plan?.projectName || 'Unknown Project',
                summary: 'Mission accomplished. All tasks were completed successfully.',
                tasksCompleted: state.plan?.tasks.length || 0,
                filesCreated: state.projectFiles.length,
                finalCost: state.totalComputeUnits,
                collaborators: [...new Set(state.plan?.tasks.map(t => t.member) || [])],
             };
            return { ...state, missionStatus: 'complete', missionDebrief: debrief, missionEvents: [...state.missionEvents, createEvent('success', `MISSION COMPLETE. Project "${debrief.projectName}" has been successfully executed.`)] };
        case 'START_NEW_MISSION':
            return { ...initialState, settings: state.settings, commsState: state.commsState };
        case 'ADD_EVENT':
            return { ...state, missionEvents: [...state.missionEvents, action.payload] };
        case 'UPDATE_CREW_STATUS':
            const newStatuses = { ...state.crewStatuses, [action.payload.name]: { ...state.crewStatuses[action.payload.name], ...action.payload.status } }
            return { ...state, crewStatuses: newStatuses };
        case 'UPDATE_FILE_TREE':
            return { ...state, projectFiles: action.payload };
        case 'SELECT_FILE':
            return { ...state, selectedFile: action.payload };
        case 'UPDATE_FILE_CONTENT': {
            const updatedFiles = updateFileInTree(state.projectFiles, action.payload.path, action.payload.newContent);
            const findUpdatedFile = (files: ProjectFile[], path: string): ProjectFile | null => {
                for (const file of files) {
                    if (file.path === path) return file;
                    if (file.isFolder && file.children) {
                        const found = findUpdatedFile(file.children, path);
                        if (found) return found;
                    }
                }
                return null;
            }
            const newSelectedFile = findUpdatedFile(updatedFiles, state.selectedFile?.path || '');
            
            // Git state update
            let newGitState = state.gitState;
            if (state.gitState.initialized && !state.gitState.modified.includes(action.payload.path) && !state.gitState.staged.includes(action.payload.path)) {
                newGitState = { ...state.gitState, modified: [...state.gitState.modified, action.payload.path] };
            }

            return { ...state, projectFiles: updatedFiles, selectedFile: newSelectedFile, gitState: newGitState };
        }
        case 'INCREMENT_TASK_INDEX':
            return { ...state, currentTaskIndex: state.currentTaskIndex + 1 };
        case 'SKIP_FAILED_TASK':
             if (state.failedTaskIndex === null) return state;
             return { ...state, currentTaskIndex: state.failedTaskIndex + 1, failedTaskIndex: null, missionStatus: 'executing' }
        case 'TASK_FAILED':
            return { ...state, missionStatus: 'error', failedTaskIndex: action.payload.index, missionEvents: [...state.missionEvents, createEvent('error', `Task #${action.payload.index + 1} failed: ${action.payload.error}`)] };
        case 'ADD_COMPUTE_UNITS':
            return { ...state, totalComputeUnits: state.totalComputeUnits + action.payload };
        case 'IMPORT_MISSION_STATE':
            if (action.payload.settings && action.payload.missionStatus) {
                // Ensure imported state has all keys
                return { ...initialState, ...action.payload };
            }
            return state;
        case 'GIT_INIT':
            return { ...state, gitState: { ...initialGitState, initialized: true } };
        case 'GIT_STAGE_ALL':
            return { ...state, gitState: { ...state.gitState, staged: [...new Set([...state.gitState.staged, ...state.gitState.modified])], modified: [] } };
        case 'GIT_COMMIT':
            const newCommit = {
                hash: Math.random().toString(36).substring(2, 9),
                message: action.payload,
                timestamp: new Date().toISOString(),
            };
            return { ...state, gitState: { ...state.gitState, staged: [], commits: [newCommit, ...state.gitState.commits] } };
        case 'SET_ASTRA_SPEAKING':
            return { ...state, isAstraSpeaking: action.payload };
        
        // Comms Center Reducers
        case 'COMMS_SELECT_FOLDER':
            return { ...state, commsState: { ...state.commsState, selectedAccountId: action.payload.accountId, selectedFolder: action.payload.folderName, selectedEmailId: null, isComposing: false } };
        case 'COMMS_SELECT_EMAIL': {
            const { emailId } = action.payload;
            // When an email is selected, also mark it as read.
            const newEmails = state.commsState.emails.map(email =>
                (email.id === emailId && !email.isRead) ? { ...email, isRead: true } : email
            );
            return {
                ...state,
                commsState: {
                    ...state.commsState,
                    selectedEmailId: emailId,
                    isComposing: false,
                    emails: newEmails,
                }
            };
        }
        case 'COMMS_UPDATE_EMAIL_STATUS': {
            const { emailId, isRead } = action.payload;
            const newEmails = state.commsState.emails.map(email =>
                email.id === emailId ? { ...email, isRead } : email
            );
            return { ...state, commsState: { ...state.commsState, emails: newEmails } };
        }
        case 'COMMS_START_COMPOSE': {
            const { mode, email } = action.payload;
            let composeFields: CommsState['composeFields'] = { to: '', subject: '', body: ''};
            if (mode === 'reply' && email) {
                composeFields = {
                    to: email.from.email,
                    subject: `Re: ${email.subject}`,
                    body: `\n\n\n--- On ${new Date(email.timestamp).toLocaleString()} ${email.from.name} wrote: ---\n> ${email.body.replace(/\n/g, '\n> ')}`
                };
            } else if (mode === 'forward' && email) {
                 composeFields = {
                    to: '',
                    subject: `Fwd: ${email.subject}`,
                    body: `\n\n\n--- Forwarded message ---\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${new Date(email.timestamp).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`
                };
            }
            return { ...state, commsState: { ...state.commsState, isComposing: true, composeMode: mode, selectedEmailId: null, composeFields } };
        }
        case 'COMMS_UPDATE_COMPOSE_FIELD': {
            const { field, value } = action.payload;
            return { ...state, commsState: { ...state.commsState, composeFields: { ...state.commsState.composeFields, [field]: value } } };
        }
        case 'COMMS_DISCARD_COMPOSE': {
            return { ...state, commsState: { ...state.commsState, isComposing: false } };
        }
        case 'COMMS_SEND_EMAIL': {
            const { composeFields, selectedAccountId } = state.commsState;
            const myAccount = state.commsState.accounts.find(a => a.id === selectedAccountId);
            if (!myAccount || !composeFields.to) return state;

            const newEmail: Email = {
                id: `email_${Date.now()}`,
                accountId: myAccount.id,
                folder: 'Sent',
                from: { name: myAccount.name, email: myAccount.email },
                to: [{ name: composeFields.to, email: composeFields.to }], // simplified
                subject: composeFields.subject,
                body: composeFields.body,
                timestamp: new Date().toISOString(),
                isRead: true,
                labels: [],
            };

            return { ...state, 
                missionEvents: [...state.missionEvents, createEvent('success', `Email sent to ${composeFields.to}`, myAccount.name)],
                commsState: { ...state.commsState, isComposing: false, emails: [...state.commsState.emails, newEmail] }
            };
        }
        default:
            return state;
    }
};

export const MissionContext = createContext<{ state: MissionState; dispatch: Dispatch<MissionAction> } | undefined>(undefined);

export const MissionProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(missionReducer, initialState);
    const executionTimeoutRef = useRef<number | null>(null);
    const lastSpokenEventIndex = useRef<number>(-1);

    const activeCrew = useMemo(() => state.settings.crewConfig.slice(0, state.settings.crewSize), [state.settings.crewConfig, state.settings.crewSize]);

    const findFile = (path: string, files: ProjectFile[]): ProjectFile | undefined => {
        for (const file of files) {
            if (file.path === path) return file;
            if (file.isFolder && file.children) {
                const found = findFile(path, file.children);
                if (found) return found;
            }
        }
        return undefined;
    };

    const executeCurrentTask = useCallback(async () => {
        if (!state.plan || state.missionStatus !== 'executing') return;

        const taskIndex = state.currentTaskIndex;
        if (taskIndex >= state.plan.tasks.length) {
            dispatch({ type: 'MISSION_COMPLETE' });
            return;
        }

        const task = state.plan.tasks[taskIndex];
        const agent = activeCrew.find(m => m.name === task.member);
        
        if (!agent) {
            dispatch({ type: 'TASK_FAILED', payload: { index: taskIndex, error: `Assigned agent "${task.member}" not found in active crew.` } });
            return;
        }

        dispatch({ type: 'UPDATE_CREW_STATUS', payload: { name: agent.name, status: { status: 'working', currentTask: task.task, progress: 25 } } });
        dispatch({ type: 'ADD_EVENT', payload: createEvent('info', `Executing task #${task.id + 1}: "${task.task}"`, agent.name) });
        
        try {
            const collaborators = selectCollaborators(agent.name, activeCrew, 2);
            const result: ExecutionResult = await executeTask(state.missionObjective, task, agent, collaborators, state.projectFiles);
            dispatch({ type: 'ADD_COMPUTE_UNITS', payload: 150 + (result.sources.length * 10) });
            
            dispatch({ type: 'UPDATE_CREW_STATUS', payload: { name: agent.name, status: { progress: 75 } } });
            dispatch({ type: 'ADD_EVENT', payload: createEvent('thought', result.thoughts, agent.name, result.sources) });
            
            let currentFiles = state.projectFiles;
            for (const action of result.actions) {
                if (action.tool === 'create_or_update_file') {
                    const { path, content } = action.args;
                    currentFiles = updateFileInTree(currentFiles, path, content);
                    dispatch({ type: 'UPDATE_FILE_TREE', payload: currentFiles });
                    dispatch({ type: 'ADD_EVENT', payload: createEvent('success', `File updated: ${path}`, agent.name) });
                } else if (action.tool === 'read_file') {
                    const file = findFile(action.args.path, currentFiles);
                    dispatch({ type: 'ADD_EVENT', payload: createEvent('info', `Read file: ${action.args.path}. Content length: ${file?.content.length || 0}`, agent.name) });
                }
            }
            
            if (result.isFinished) {
                dispatch({ type: 'UPDATE_CREW_STATUS', payload: { name: agent.name, status: { status: 'complete', progress: 100, currentTask: undefined } } });
                dispatch({ type: 'INCREMENT_TASK_INDEX' });
            } else {
                dispatch({ type: 'TASK_FAILED', payload: { index: taskIndex, error: `Agent ${agent.name} did not finish the task. It may require more steps.` } });
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            dispatch({ type: 'UPDATE_CREW_STATUS', payload: { name: agent.name, status: { status: 'error', currentTask: errorMessage } } });
            dispatch({ type: 'TASK_FAILED', payload: { index: taskIndex, error: errorMessage } });
        }
    }, [state.missionStatus, state.plan, state.currentTaskIndex, state.missionObjective, state.projectFiles, activeCrew]);

    // Main execution loop
    useEffect(() => {
        if (state.missionStatus === 'executing') {
            if (executionTimeoutRef.current) clearTimeout(executionTimeoutRef.current);
            executionTimeoutRef.current = window.setTimeout(executeCurrentTask, 2000);
        }
        return () => {
            if (executionTimeoutRef.current) clearTimeout(executionTimeoutRef.current);
        };
    }, [state.missionStatus, state.currentTaskIndex, executeCurrentTask]);
    
    // Side effect for planning
    useEffect(() => {
        const performPlanning = async () => {
            if (state.missionStatus === 'planning') {
                try {
                    const plan = await generatePlan(state.missionObjective, activeCrew);
                    dispatch({ type: 'PLANNING_COMPLETE', payload: plan });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    dispatch({ type: 'PLANNING_FAILED', payload: errorMessage });
                }
            }
        };
        performPlanning();
    }, [state.missionStatus, state.missionObjective, activeCrew]);

    // Side effect for special UI-triggered events
    useEffect(() => {
        const lastEvent = state.missionEvents[state.missionEvents.length - 1];
        if (!lastEvent || lastEvent.agent === 'Commander' ) return;

        const performAction = async () => {
             if (lastEvent.message === 'DOWNLOAD_PROJECT') {
                const filesToZip = [...state.projectFiles];
                STATIC_PROJECT_FILES.forEach(staticFile => {
                    if (!findFile(staticFile.filename, filesToZip)) {
                        const newFile: ProjectFile = { name: staticFile.filename, path: staticFile.filename, content: staticFile.content, isFolder: false };
                        filesToZip.push(newFile);
                    }
                });
                await downloadProjectAsZip(filesToZip, state.plan?.projectName || 'astra-project');
            } else if (lastEvent.message === 'GENERATE_README') {
                 if (state.projectFiles.length > 0) {
                    dispatch({ type: 'ADD_EVENT', payload: createEvent('info', 'Generating README.md...', 'System') });
                    try {
                        const readmeContent = await generateReadme(state.missionObjective, state.projectFiles);
                        const updatedFiles = updateFileInTree(state.projectFiles, 'README.md', readmeContent);
                        dispatch({ type: 'UPDATE_FILE_TREE', payload: updatedFiles });
                        dispatch({ type: 'ADD_EVENT', payload: createEvent('success', 'README.md generated successfully.', 'System') });
                    } catch (e) {
                         dispatch({ type: 'ADD_EVENT', payload: createEvent('error', 'Failed to generate README.md.', 'System') });
                    }
                 }
            } else if (lastEvent.message.startsWith('Skipping failed task')) {
                 if (state.failedTaskIndex !== null) {
                    dispatch({ type: 'SKIP_FAILED_TASK' });
                 }
            }
        };
        performAction();
        
    }, [state.missionEvents, state.missionObjective, state.plan, state.projectFiles, state.failedTaskIndex]);

    // Side effect for Text-to-Speech
    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            console.warn("Text-to-Speech not supported in this browser.");
            return;
        }

        const latestEventIndex = state.missionEvents.length - 1;
        if (latestEventIndex > lastSpokenEventIndex.current && latestEventIndex > 0) {
            const eventToSpeak = state.missionEvents[latestEventIndex];
            
            // Only speak non-thought, non-commander events
            if (eventToSpeak.type !== 'thought' && eventToSpeak.agent !== 'Commander' && !eventToSpeak.message.startsWith('Executing task')) {
                const utterance = new SpeechSynthesisUtterance(`${eventToSpeak.agent || 'System'}: ${eventToSpeak.message}`);
                utterance.onstart = () => dispatch({ type: 'SET_ASTRA_SPEAKING', payload: true });
                utterance.onend = () => dispatch({ type: 'SET_ASTRA_SPEAKING', payload: false });
                utterance.onerror = () => dispatch({ type: 'SET_ASTRA_SPEAKING', payload: false });
                window.speechSynthesis.speak(utterance);
            }
            lastSpokenEventIndex.current = latestEventIndex;
        }
    }, [state.missionEvents]);


    return (
        <MissionContext.Provider value={{ state, dispatch }}>
            {children}
        </MissionContext.Provider>
    );
};