import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { Plan, PrioritizedTask } from '../types';
import { CREW_MEMBERS } from '../constants.tsx';
import { useMission } from '../context/MissionContext';
import { TaskDetailModal } from './TaskDetailModal';
import { ClockIcon, LoadingIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface MissionTimelineProps {
    plan: Plan | null;
}

const statusMap: Record<PrioritizedTask['status'], { icon: React.ReactNode; border: string; bg: string; pulse: boolean }> = {
    pending: { icon: <ClockIcon />, border: 'border-gray-600', bg: 'bg-gray-800/50', pulse: false },
    working: { icon: <LoadingIcon />, border: 'border-yellow-500', bg: 'bg-yellow-900/50', pulse: true },
    complete: { icon: <CheckCircleIcon />, border: 'border-green-500', bg: 'bg-green-900/50', pulse: false },
    error: { icon: <ExclamationTriangleIcon />, border: 'border-red-500', bg: 'bg-red-900/50', pulse: false },
};

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ plan }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const taskPositions = useRef<{ [key: number]: { x: number; y: number } }>({});
    const [selectedTask, setSelectedTask] = useState<PrioritizedTask | null>(null);

    const tasksWithLevels = useMemo(() => {
        if (!plan) return [];
        const tasks = plan.tasks.map(task => ({ ...task, level: -1, deps: task.dependencies }));
        
        let changed = true;
        while(changed) {
            changed = false;
            for(const task of tasks) {
                if (task.level !== -1) continue;
                if (task.deps.length === 0) {
                    task.level = 0;
                    changed = true;
                } else {
                    const maxDepLevel = Math.max(...task.deps.map(depId => {
                        const depTask = tasks.find(t => t.id === depId);
                        return depTask ? depTask.level : -1;
                    }));
                    if (maxDepLevel !== -1) {
                        task.level = maxDepLevel + 1;
                        changed = true;
                    }
                }
            }
        }
        return tasks;
    }, [plan]);

    const groupedByLevel = useMemo(() => {
        const groups: PrioritizedTask[][] = [];
        tasksWithLevels.forEach(task => {
            if (task.level === -1) task.level = 0; // Fallback for circular dependencies
            if (!groups[task.level]) groups[task.level] = [];
            groups[task.level].push(task);
        });
        return groups;
    }, [tasksWithLevels]);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || !plan) return;
        
        while (svg.firstChild) { svg.removeChild(svg.firstChild); }
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead'); marker.setAttribute('markerWidth','10'); marker.setAttribute('markerHeight','7');
        marker.setAttribute('refX','0'); marker.setAttribute('refY','3.5'); marker.setAttribute('orient','auto');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points','0 0, 10 3.5, 0 7'); polygon.setAttribute('fill','rgba(129, 140, 248, 0.6)');
        marker.appendChild(polygon); defs.appendChild(marker); svg.appendChild(defs);

        plan.tasks.forEach(task => {
            task.dependencies.forEach(depId => {
                const startPos = taskPositions.current[depId];
                const endPos = taskPositions.current[task.id];
                if (startPos && endPos) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const depTask = plan.tasks.find(t => t.id === depId);
                    const isCompleted = task.status === 'complete' && depTask?.status === 'complete';
                    line.setAttribute('d', `M ${startPos.x} ${startPos.y} C ${startPos.x + 50} ${startPos.y}, ${endPos.x - 50} ${endPos.y}, ${endPos.x} ${endPos.y}`);
                    line.setAttribute('stroke', isCompleted ? 'rgb(74 222 128)' : 'rgba(129, 140, 248, 0.6)');
                    line.setAttribute('stroke-width', '2.5');
                    line.setAttribute('fill', 'none');
                    line.setAttribute('marker-end', 'url(#arrowhead)');
                    svg.appendChild(line);
                }
            });
        });
    }, [plan, groupedByLevel]);
    
    if (!plan) {
        return <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">No mission plan has been generated.</div>;
    }
    
    return (
        <>
            <div className="p-4 glassmorphism rounded-xl h-full overflow-auto scrollbar-thin">
                <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Mission Timeline: {plan.projectName}</h3>
                <div className="relative">
                    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
                    <div className="flex gap-8 items-start relative z-10">
                        {groupedByLevel.map((levelTasks, levelIndex) => (
                            <div key={levelIndex} className="flex flex-col gap-6 items-center flex-shrink-0">
                                <h4 className="font-orbitron text-cyan-400">Phase {levelIndex + 1}</h4>
                                {levelTasks.map(task => {
                                    const member = CREW_MEMBERS.find(m => m.name === task.member);
                                    const statusInfo = statusMap[task.status] || statusMap.pending;
                                    
                                    return (
                                        <button 
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className={`w-64 p-3 rounded-lg border-2 text-left transition-transform hover:scale-105 ${statusInfo.border} ${statusInfo.bg} ${statusInfo.pulse ? 'animate-pulse' : ''}`}
                                            ref={el => {
                                                if (el) {
                                                    const rect = el.getBoundingClientRect();
                                                    const containerRect = el.parentElement?.parentElement?.getBoundingClientRect();
                                                    if (containerRect) {
                                                        taskPositions.current[task.id] = {
                                                            x: rect.left - containerRect.left,
                                                            y: rect.top - containerRect.top + rect.height / 2
                                                        };
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-5 h-5 text-cyan-400">{member?.icon}</span>
                                                <p className="font-bold text-sm text-gray-200">{member?.name}</p>
                                                <div className="flex-grow" />
                                                <span className={`w-5 h-5 ${statusInfo.border.replace('border-','text-')}`}>{statusInfo.icon}</span>
                                            </div>
                                            <p className="text-xs text-gray-300">{task.task}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
        </>
    );
};