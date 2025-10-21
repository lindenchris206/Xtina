import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { agents as agentList } from '../../data/agents';
import { Agent } from '../../types';

const AssistantPanel: React.FC = () => {
  const { messages, sendMessage, streaming, interrupt } = useChat();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'agents'>('chat');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-gray-200">
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'chat' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('chat')}
        >
          Assistant
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'agents' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('agents')}
        >
          Crew ({agentList.length})
        </button>
      </div>

      {activeTab === 'chat' && (
        <>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Chat with your AI Crew..."
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />
              <button
                onClick={streaming ? interrupt : handleSend}
                className={`px-4 py-2 rounded-md font-semibold ${streaming ? 'bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {streaming ? 'Stop' : 'Send'}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'agents' && <AgentRoster agents={agentList} />}
    </div>
  );
};


const AgentRoster: React.FC<{ agents: Agent[] }> = ({ agents }) => {
    return (
        <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin">
            {agents.map(agent => (
                <div key={agent.name} className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="font-bold text-indigo-400">{agent.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{agent.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Specialty: {agent.primarySpecialty}</p>
                </div>
            ))}
        </div>
    )
}

export default AssistantPanel;
