import { useContext } from 'react';
import { MissionContext } from '../context/MissionContext';

export const useMissionContext = () => {
    const context = useContext(MissionContext);
    if (context === undefined) {
        throw new Error('useMissionContext must be used within a MissionProvider');
    }
    return context;
};
