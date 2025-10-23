import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { AVATARS } from './avatars';
import { LoadingIcon } from './icons';

export const LoginScreen: React.FC = () => {
    const { login } = useMission();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // FIX: Changed 'Lexi' to 'Astra' to use the correct avatar component.
    const AvatarComponent = AVATARS['Astra'].component;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const success = await login(username, password);
        if (!success) {
            setError('Invalid username or password.');
            setIsLoading(false);
        }
        // On success, the main app will render automatically.
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-48 h-48 astra-avatar-idle mb-4">
                        <AvatarComponent />
                    </div>
                    <h1 className="text-3xl font-orbitron text-purple-300">AI Crew Commander</h1>
                    <p className="text-gray-400">V 2.0 - Awaiting Authentication</p>
                </div>
                <div className="glassmorphism rounded-xl p-6 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500"
                                required
                            />
                        </div>
                         {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        <div className="text-xs text-gray-500 text-center pt-2">
                            Default admin credentials: admin / admin
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 px-4 rounded-md transition-colors disabled:bg-gray-600"
                        >
                           {isLoading && <LoadingIcon />} Authenticate
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
