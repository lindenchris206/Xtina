import React from 'react';
import { AgentType, ActiveView } from '../types';
import Avatar from './Avatar';
import { BrainCircuit, Users, Search, Database, Bot, Gavel, FileText, Lock, FileArchive } from './icons/Icons';

interface SidebarProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActive