import React from 'react';
import { GithubIcon, CheckIcon } from '../icons';

interface MockPageProps {
    formValues: Record<string, string>;
    activeElement: string | null;
}

const InputField: React.FC<{ name: string; label: string; type?: string; placeholder?: string; value: string; isActive: boolean }> = 
({ name, label, type = 'text', placeholder, value, isActive }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input 
            id={name}
            name={name}
            type={type} 
            placeholder={placeholder}
            value={value}
            readOnly
            className={`w-full bg-gray-900/50 border-2 rounded-md px-3 py-2 text-sm transition-all duration-300 ${isActive ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : 'border-white/20'}`} 
        />
    </div>
);

// FIX: Updated component to accept optional props passed by the browser simulator.
export const MockHomePage: React.FC<Partial<MockPageProps>> = () => <div className="p-8 text-white">
    <h1 className="text-4xl font-bold mb-4">Command Deck OS</h1>
    <p>This is the home page for the simulated browser. Ready for automation commands.</p>
</div>;

export const MockGithubSignupPage: React.FC<MockPageProps> = ({ formValues, activeElement }) => (
    <div className="p-8 text-white max-w-md mx-auto">
        <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-12 h-12 text-white"><GithubIcon /></span>
            <h1 className="text-3xl font-bold">Create your GitHub account</h1>
        </div>
        <form className="space-y-4">
            <InputField name="[name='username']" label="Username" value={formValues["[name='username']"] || ''} isActive={activeElement === "[name='username']"} />
            <InputField name="[name='email']" label="Email" type="email" value={formValues["[name='email']"] || ''} isActive={activeElement === "[name='email']"} />
            <InputField name="[name='password']" label="Password" type="password" value={formValues["[name='password']"] || ''} isActive={activeElement === "[name='password']"} />
            <button type="submit" className={`w-full py-2.5 rounded-md font-semibold text-white transition-all duration-300 ${activeElement === "button[type='submit']" ? 'bg-green-500 scale-105' : 'bg-green-600 hover:bg-green-500'}`}>
                Create account
            </button>
        </form>
    </div>
);

// FIX: Updated component to accept optional props passed by the browser simulator.
export const MockGithubSignupSuccessPage: React.FC<Partial<MockPageProps>> = () => (
    <div className="p-8 text-white text-center">
        <span className="w-16 h-16 text-green-400 mx-auto block"><CheckIcon /></span>
        <h1 className="text-4xl font-bold mb-4 mt-4">Welcome to GitHub!</h1>
        <p>Your account has been successfully created.</p>
    </div>
);

export const MockGithubNewRepoPage: React.FC<MockPageProps> = ({ formValues, activeElement }) => (
    <div className="p-8 text-white max-w-lg mx-auto">
         <h1 className="text-3xl font-bold mb-6">Create a new repository</h1>
         <form className="space-y-4 p-4 border border-white/20 rounded-lg">
             <InputField name="[name='repo_name']" label="Repository name" value={formValues["[name='repo_name']"] || ''} isActive={activeElement === "[name='repo_name']"} />
             <InputField name="[name='description']" label="Description (optional)" value={formValues["[name='description']"] || ''} isActive={activeElement === "[name='description']"} />
            <button type="submit" className={`w-full py-2.5 rounded-md font-semibold text-white transition-all duration-300 ${activeElement === "button[type='submit']" ? 'bg-green-500 scale-105' : 'bg-green-600 hover:bg-green-500'}`}>
                Create repository
            </button>
         </form>
    </div>
);

export const MockVercelDeployPage: React.FC<MockPageProps> = ({ formValues, activeElement }) => (
    <div className="p-8 text-white max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Deploy Your Project</h1>
        <form className="space-y-4">
            <InputField name="[name='project_name']" label="Project Name" value={formValues["[name='project_name']"] || ''} isActive={activeElement === "[name='project_name']"} />
            <button type="submit" className={`w-full py-2.5 rounded-md font-semibold text-white transition-all duration-300 ${activeElement === "button[type='submit']" ? 'bg-blue-500 scale-105' : 'bg-blue-600 hover:bg-blue-500'}`}>
                Deploy
            </button>
        </form>
    </div>
);

const MOCK_PAGES: Record<string, React.ComponentType<any>> = {
    'home': MockHomePage,
    'github_signup': MockGithubSignupPage,
    'github_signup_success': MockGithubSignupSuccessPage,
    'github_new_repo': MockGithubNewRepoPage,
    'vercel_deploy': MockVercelDeployPage,
};

export const getMockPage = (url: string) => MOCK_PAGES[url] || MockHomePage;