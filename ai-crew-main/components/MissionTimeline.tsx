import React, { useMemo, useRef, useEffect } from 'react';
import type { Plan } from '../types';
import { CREW_MEMBERS } from '../constants';
import { useMission } from '../context/MissionContext';

interface MissionTimelineProps {
    plan: Plan | null;
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ plan }) => {
    const { appState, completedTasks } = useMission();
    const svgRef = useRef<SVGSVGElement>(null);
    const taskPositions = useRef<{ [key: number]: { x: number; y: number } }>({});

    const tasksWithLevels = useMemo(() => {
        if (!plan) return [];
        const tasks = plan.tasks.map((_, index) => ({ index, level: -1, deps: plan.tasks[index].dependencies }));
        
        let changed = true;
        while(changed) {
            changed = false;
            for(const task of tasks) {
                if (task.level !== -1) continue;
                if (task.deps.length === 0) {
                    task.level = 0;
                    changed = true;
                } else {
                    const maxDepLevel = Math.max(...task.deps.map(depIndex => tasks[depIndex].level));
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
        const groups: number[][] = [];
        tasksWithLevels.forEach(task => {
            if (!groups[task.level]) groups[task.level] = [];
            groups[task.level].push(task.index);
        });
        return groups;
    }, [tasksWithLevels]);

    useEffect(() => {
        // Redraw lines on update
        const svg = svgRef.current;
        if (!svg) return;
        
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        plan?.tasks.forEach((task, index) => {
            task.dependencies.forEach(depIndex => {
                const startPos = taskPositions.current[depIndex];
                const endPos = taskPositions.current[index];
                if (startPos && endPos) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const isCompleted = index < completedTasks && depIndex < completedTasks;
                    line.setAttribute('d', `M ${startPos.x} ${startPos.y} C ${startPos.x + 50} ${startPos.y}, ${endPos.x - 50} ${endPos.y}, ${endPos.x} ${endPos.y}`);
                    line.setAttribute('stroke', isCompleted ? 'rgb(74 222 128)' : 'rgba(129, 140, 248, 0.6)');
                    line.setAttribute('stroke-width', '2.5');
                    line.setAttribute('fill', 'none');
                    line.setAttribute('marker-end', 'url(#arrowhead)');
                    svg.appendChild(line);
                }
            });
        });
    }, [plan, groupedByLevel, completedTasks]);
    
    if (!plan) {
        return <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">No mission plan has been generated.</div>;
    }
    
    return (
        <div className="p-4 glassmorphism rounded-xl h-full overflow-auto scrollbar-thin">
            <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Mission Timeline: {plan.projectName}</h3>
            <div className="relative">
                <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(129, 140, 248, 0.6)" />
                        </marker>
                    </defs>
                </svg>
                <div className="flex gap-8 items-start">
                    {groupedByLevel.map((levelTasks, levelIndex) => (
                        <div key={levelIndex} className="flex flex-col gap-6 items-center flex-shrink-0">
                            <h4 className="font-orbitron text-cyan-400">Phase {levelIndex + 1}</h4>
                            {levelTasks.map(taskIndex => {
                                const task = plan.tasks[taskIndex];
                                const member = CREW_MEMBERS.find(m => m.name === task.member);
                                const status = taskIndex < completedTasks ? 'complete' : appState.missionStatus === 'executing' && taskIndex === completedTasks ? 'working' : 'pending';
                                
                                return (
                                     <div 
                                        key={taskIndex} 
                                        className={`w-64 p-3 rounded-lg border-2 ${
                                            status === 'complete' ? 'border-green-500 bg-green-900/50' :
                                            status === 'working' ? 'border-yellow-500 bg-yellow-900/50 animate-pulse' :
                                            'border-gray-600 bg-gray-800/50'
                                        }`}
                                        ref={el => {
                                            if (el) {
                                                const rect = el.getBoundingClientRect();
                                                const containerRect = el.parentElement?.parentElement?.getBoundingClientRect();
                                                if (containerRect) {
                                                    taskPositions.current[taskIndex] = {
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
                                        </div>
                                        <p className="text-xs text-gray-300">{task.task}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};