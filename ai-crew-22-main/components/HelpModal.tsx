import React, { useState } from 'react';
import { README_CONTENT, DEPLOYMENT_CONTENT } from '../services/staticProjectFiles';

interface HelpModalProps {
    onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-900 rounded-md p-3 my-2 text-xs text-cyan-300 overflow-x-auto scrollbar-thin">
        <code>{children}</code>
    </pre>
);

const LocalSetupContent: React.FC = () => (
    <div className="text-sm text-gray-300 space-y-4">
        <p>Follow these steps to run your generated project on your local computer.</p>

        <div>
            <h4 className="font-bold text-cyan-300">1. Download and Unzip</h4>
            <p>Click the "Download Project" button after a mission is complete to get a `.zip` file. Unzip it to a folder on your computer.</p>
        </div>

        <div>
            <h4 className="font-bold text-cyan-300">2. Open a Terminal</h4>
            <p>Navigate to the unzipped project folder using your command-line interface (Terminal, Command Prompt, PowerShell).</p>
        </div>
        
         <div>
            <h4 className="font-bold text-cyan-300">3. Run the Setup Script</h4>
            <p>The project includes automated setup scripts. Run the one for your operating system.</p>
            
            <h5 className="font-semibold mt-2 text-gray-200">For macOS or Linux:</h5>
            <CodeBlock>
                chmod +x setup.sh{'\n'}
                ./setup.sh
            </CodeBlock>

             <h5 className="font-semibold mt-2 text-gray-200">For Windows:</h5>
            <CodeBlock>
                setup.bat
            </CodeBlock>
            <p className="text-xs text-gray-400">The script will install all necessary dependencies.</p>
        </div>
        
        <div>
            <h4 className="font-bold text-cyan-300">4. Set API Key & Run</h4>
            <p>You must provide your Gemini API key as an environment variable named <code className="bg-gray-700 text-xs p-1 rounded">API_KEY</code>.</p>
             <h5 className="font-semibold mt-2 text-gray-200">For macOS or Linux:</h5>
            <CodeBlock>
                export API_KEY="YOUR_GEMINI_API_KEY"{'\n'}
                npm run dev
            </CodeBlock>
             <h5 className="font-semibold mt-2 text-gray-200">For Windows:</h5>
            <CodeBlock>
                set API_KEY="YOUR_GEMINI_API_KEY"{'\n'}
                npm run dev
            </CodeBlock>
        </div>

        <p>Your new application will now be running, typically at <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">http://localhost:5173</a>.</p>
    </div>
);

const HostingContent: React.FC = () => (
    <div className="text-sm text-gray-300 space-y-4">
        <p>You can deploy your project to the web for free using services like Vercel or Netlify. You'll need to upload your project to a Git provider (like GitHub) first.</p>

        <div>
            <h4 className="font-bold text-cyan-300">Prerequisites</h4>
            <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                <li>A GitHub, GitLab, or Bitbucket account.</li>
                <li>Your project code pushed to a repository on one of those platforms.</li>
            </ul>
        </div>

        <div>
            <h4 className="font-bold text-cyan-300">Deploying with Vercel (Recommended)</h4>
            <ol className="list-decimal list-inside space-y-2 mt-1">
                <li>Sign up for a free account on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Vercel</a>.</li>
                <li>From your dashboard, click "Add New..." &rarr; "Project".</li>
                <li>Import the Git repository containing your project.</li>
                <li>Vercel will auto-detect the Vite settings. They should be correct by default.</li>
                <li>Before deploying, expand the "Environment Variables" section and add a variable:
                     <ul className="list-disc list-inside text-xs space-y-1 mt-1 pl-4">
                        <li><strong>Name:</strong> <code className="bg-gray-700 text-xs p-1 rounded">API_KEY</code></li>
                        <li><strong>Value:</strong> (Paste your Gemini API key here)</li>
                    </ul>
                </li>
                <li>Click "Deploy". Vercel will build and host your site on a public URL.</li>
            </ol>
        </div>
         <div>
            <h4 className="font-bold text-cyan-300">Deploying with Netlify</h4>
            <ol className="list-decimal list-inside space-y-2 mt-1">
                <li>Sign up for a free account on <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Netlify</a>.</li>
                <li>Click "Add new site" &rarr; "Import an existing project".</li>
                <li>Connect to your Git provider and select your project's repository.</li>
                <li>Go to "Site settings" &rarr; "Build & deploy" &rarr; "Environment" and add your <code className="bg-gray-700 text-xs p-1 rounded">API_KEY</code> environment variable.</li>
                 <li>Go to the "Deploys" tab and trigger a deploy. Netlify will provide a live URL when it's finished.</li>
            </ol>
        </div>
    </div>
);


export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'local' | 'hosting'>('local');

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 w-full max-w-3xl h-full max-h-[80vh] rounded-xl border border-white/20 shadow-lg flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-orbitron text-indigo-300">Help & Documentation</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </header>
                <div className="flex border-b border-gray-700">
                     <button 
                        onClick={() => setActiveTab('local')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'local' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400'}`}
                    >
                        Local Setup
                    </button>
                    <button 
                        onClick={() => setActiveTab('hosting')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'hosting' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400'}`}
                    >
                        Free Hosting
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto scrollbar-thin">
                    {activeTab === 'local' ? <LocalSetupContent /> : <HostingContent />}
                </div>
                 <footer className="p-4 border-t border-gray-700 text-right">
                    <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors">Close</button>
                 </footer>
            </div>
        </div>
    );
};