/**
 * Connections Page - All API Integrations Hub
 * Beautiful UI showcasing 80+ API providers
 */

import React, { useState, useMemo } from 'react';
import {
  API_PROVIDERS,
  API_PROVIDER_CATEGORIES,
  getAllCategories,
  searchProviders,
  type APIProvider,
} from '../../../../shared/constants/apiProviders';
import type { StoredAPIKey } from '../../../../shared/types';

// Icons (you can replace with your icon library)
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

interface ConnectionsPageProps {
  connectedKeys?: StoredAPIKey[];
  onConnect?: (provider: APIProvider) => void;
  onManage?: (provider: APIProvider, keys: StoredAPIKey[]) => void;
}

export const ConnectionsPage: React.FC<ConnectionsPageProps> = ({
  connectedKeys = [],
  onConnect,
  onManage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  // Get connected provider IDs
  const connectedProviderIds = useMemo(() => {
    return new Set(connectedKeys.map(k => k.providerId));
  }, [connectedKeys]);

  // Filter providers
  const filteredProviders = useMemo(() => {
    let providers = API_PROVIDERS;

    // Search filter
    if (searchQuery) {
      providers = searchProviders(searchQuery);
    }

    // Category filter
    if (selectedCategory) {
      providers = providers.filter(p => p.category === selectedCategory);
    }

    // Connected filter
    if (showConnectedOnly) {
      providers = providers.filter(p => connectedProviderIds.has(p.id));
    }

    return providers;
  }, [searchQuery, selectedCategory, showConnectedOnly, connectedProviderIds]);

  // Group providers by category
  const providersByCategory = useMemo(() => {
    const grouped: Record<string, APIProvider[]> = {};
    filteredProviders.forEach(provider => {
      if (!grouped[provider.category]) {
        grouped[provider.category] = [];
      }
      grouped[provider.category].push(provider);
    });
    return grouped;
  }, [filteredProviders]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: API_PROVIDERS.length,
      connected: connectedProviderIds.size,
      categories: getAllCategories().length,
      keys: connectedKeys.length,
    };
  }, [connectedProviderIds, connectedKeys]);

  // Get keys for provider
  const getProviderKeys = (providerId: string): StoredAPIKey[] => {
    return connectedKeys.filter(k => k.providerId === providerId);
  };

  // Check if provider is connected
  const isConnected = (providerId: string): boolean => {
    return connectedProviderIds.has(providerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                API Connections
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your integrations across 80+ providers
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Grid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.List />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Providers" value={stats.total} color="blue" />
            <StatCard label="Connected" value={stats.connected} color="green" />
            <StatCard label="Categories" value={stats.categories} color="purple" />
            <StatCard label="Total Keys" value={stats.keys} color="orange" />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Icons.Search />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Categories</option>
              {getAllCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Connected Filter */}
            <button
              onClick={() => setShowConnectedOnly(!showConnectedOnly)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showConnectedOnly
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-blue-500/50'
              }`}
            >
              <Icons.Filter />
              Connected Only
            </button>
          </div>
        </div>
      </div>

      {/* Providers Grid/List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {Object.entries(providersByCategory).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No providers found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(providersByCategory).map(([category, providers]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  {category}
                  <span className="text-sm font-normal text-slate-500">
                    ({providers.length})
                  </span>
                </h2>

                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-2'
                }>
                  {providers.map(provider => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      isConnected={isConnected(provider.id)}
                      keyCount={getProviderKeys(provider.id).length}
                      viewMode={viewMode}
                      onConnect={() => onConnect?.(provider)}
                      onManage={() => onManage?.(provider, getProviderKeys(provider.id))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ label, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="glassmorphism rounded-lg p-4 border border-slate-700/50">
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`h-1 w-full bg-gradient-to-r ${colors[color]} rounded-full mt-2`} />
    </div>
  );
};

// Provider Card Component
const ProviderCard: React.FC<{
  provider: APIProvider;
  isConnected: boolean;
  keyCount: number;
  viewMode: 'grid' | 'list';
  onConnect?: () => void;
  onManage?: () => void;
}> = ({ provider, isConnected, keyCount, viewMode, onConnect, onManage }) => {
  if (viewMode === 'list') {
    return (
      <div className="glassmorphism rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all flex items-center justify-between group">
        <div className="flex items-center gap-4 flex-1">
          {/* Status Indicator */}
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />

          {/* Provider Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{provider.name}</h3>
              {keyCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                  {keyCount} {keyCount === 1 ? 'key' : 'keys'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{provider.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={provider.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
            title="View Documentation"
          >
            <Icons.ExternalLink />
          </a>

          {isConnected ? (
            <button
              onClick={onManage}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all flex items-center gap-2"
            >
              <Icons.Settings />
              Manage
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium transition-all flex items-center gap-2"
            >
              <Icons.Plus />
              Connect
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="glassmorphism rounded-lg p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all group relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          {/* Status Badge */}
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
              <Icons.Check />
              Connected
            </div>
          ) : (
            <div className="px-2.5 py-1 bg-slate-700/50 text-slate-400 rounded-full text-xs font-medium">
              Not Connected
            </div>
          )}

          {/* Documentation Link */}
          <a
            href={provider.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
            title="View Documentation"
          >
            <Icons.ExternalLink />
          </a>
        </div>

        {/* Provider Icon (placeholder - you can add actual logos) */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xl">
          {provider.name.charAt(0)}
        </div>

        {/* Provider Info */}
        <h3 className="font-semibold text-white mb-1 text-lg">{provider.name}</h3>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{provider.description}</p>

        {/* Key Count */}
        {keyCount > 0 && (
          <div className="mb-4 text-sm text-slate-300">
            <span className="font-medium">{keyCount}</span> {keyCount === 1 ? 'key' : 'keys'} configured
          </div>
        )}

        {/* Action Button */}
        {isConnected ? (
          <button
            onClick={onManage}
            className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            <Icons.Settings />
            Manage Keys
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Icons.Plus />
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;
