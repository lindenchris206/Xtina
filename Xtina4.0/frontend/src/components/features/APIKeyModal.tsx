/**
 * API Key Configuration Modal
 * Beautiful modal for adding/editing API keys
 */

import React, { useState, useEffect } from 'react';
import type { APIProvider } from '../../../../shared/constants/apiProviders';
import { validateKeyFormat } from '../../../../shared/constants/apiProviders';

interface APIKeyModalProps {
  isOpen: boolean;
  provider: APIProvider | null;
  onClose: () => void;
  onSave: (data: { name: string; fields: Record<string, string>; tags: string[] }) => Promise<void>;
  existingData?: {
    name: string;
    fields: Record<string, string>;
    tags: string[];
  };
}

export const APIKeyModal: React.FC<APIKeyModalProps> = ({
  isOpen,
  provider,
  onClose,
  onSave,
  existingData,
}) => {
  const [name, setName] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (existingData) {
      setName(existingData.name);
      setFields(existingData.fields);
      setTags(existingData.tags);
    } else if (provider) {
      setName(`${provider.name} Key`);
      setFields({});
      setTags([]);
    }
  }, [existingData, provider]);

  if (!isOpen || !provider) return null;

  const handleFieldChange = (fieldName: string, value: string) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    provider.fields.forEach(field => {
      if (field.required && !fields[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Validate key format if applicable
    const apiKeyField = provider.fields.find(f => f.name === 'apiKey');
    if (apiKeyField && fields.apiKey && provider.keyFormat) {
      if (!validateKeyFormat(provider.id, fields.apiKey)) {
        newErrors.apiKey = 'Invalid key format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({ name, fields, tags });
      handleClose();
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setFields({});
    setTags([]);
    setErrors({});
    setShowPassword({});
    onClose();
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/50 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {existingData ? 'Edit' : 'Connect'} {provider.name}
              </h2>
              <p className="text-blue-100 text-sm mt-1">{provider.description}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
              {errors.general}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Configuration Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g., Production API Key"
              required
            />
            <p className="text-xs text-slate-500 mt-1.5">
              A friendly name to identify this key
            </p>
          </div>

          {/* Dynamic Fields */}
          {provider.fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              <div className="relative">
                <input
                  type={field.type === 'password' && !showPassword[field.name] ? 'password' : 'text'}
                  value={fields[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className={`w-full bg-slate-800/50 border ${
                    errors[field.name] ? 'border-red-500/50' : 'border-slate-700/50'
                  } rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    field.type === 'password' ? 'pr-12' : ''
                  }`}
                  placeholder={field.placeholder}
                  required={field.required}
                />

                {/* Password Toggle */}
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.name)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword[field.name] ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Field Error */}
              {errors[field.name] && (
                <p className="text-sm text-red-400 mt-1.5">{errors[field.name]}</p>
              )}

              {/* Key Format Hint */}
              {field.name === 'apiKey' && provider.keyPrefix && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Format: {provider.keyPrefix}...
                </p>
              )}
            </div>
          ))}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="production, backup, testing"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Comma-separated tags to organize your keys
            </p>
          </div>

          {/* Documentation Link */}
          {provider.documentationUrl && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-300 mb-2">
                    Need help finding your API key?
                  </p>
                  <a
                    href={provider.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                  >
                    View {provider.name} Documentation
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {existingData ? 'Update' : 'Save'} Key
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default APIKeyModal;
