import React from 'react';
import { AstraUI } from './components/AstraUI';
import { MissionProvider } from './context/MissionContext';

const App: React.FC = () => {
    return (
        <MissionProvider>
            <AstraUI />
        </MissionProvider>
    );
};

export default App;
