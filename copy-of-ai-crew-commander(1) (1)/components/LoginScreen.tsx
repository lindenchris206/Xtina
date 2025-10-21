import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { AstraAvatar } from './avatars';
import { LoadingIcon } from './icons';

export const LoginScreen: React.FC = () => {
    const { login } = useMission();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const success = await login(username, password);
        if (!success) {
            setError('Authentication failed. Please check credentials.');
            setIsLoading(false);
        }
        // On success, the main app will render automatically.
    };

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 text-center login-container-animate">
            <div className="w-full max-w-sm">
                {/* Astra Orb Avatar */}
                <div className="w-56 h-56 mx-auto mb-4">
                    <AstraAvatar isTalking={false} />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-orbitron login-glow-text mb-2">
                    AI Crew Commander
                </h1>
                <p className="text-gray-400 mb-8">Awaiting Authentication</p>

                {/* Login Form */}
                <div className="glassmorphism rounded-xl p-6 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="login-input"
                                placeholder="Username"
                                required
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                placeholder="Password"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-pink-400">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 font-bold py-3 px-4 rounded-md transition-all duration-300 login-button-glow"
                        >
                           {isLoading ? <LoadingIcon /> : 'Authenticate'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};