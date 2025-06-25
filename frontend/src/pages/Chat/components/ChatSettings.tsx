/**
 * Chat Settings - Settings modal for chat customization
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Bot,
  Sliders,
  Globe,
  Shield,
  Database,
  Zap,
  Save,
  RotateCcw,
  Upload,
  Download,
  FileText,
  Mic,
  Volume2,
  Eye,
  Moon,
  Sun,
  Monitor,
  Languages,
  Bell,
  Lock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Conversation, Agent } from '../types';

interface ChatSettings {
  // General Settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
  showTypingIndicator: boolean;
  
  // Model Settings
  defaultAgent: number | null;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
  systemPrompt: string;
  
  // Advanced Settings
  streamResponses: boolean;
  saveConversationHistory: boolean;
  enableAnalytics: boolean;
  autoTranslate: boolean;
  moderationEnabled: boolean;
  maxConversationLength: number;
  autoDeleteAfterDays: number;
  
  // Privacy Settings
  dataSharingEnabled: boolean;
  anonymousUsage: boolean;
  encryptLocalStorage: boolean;
  clearDataOnExit: boolean;
}

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  selectedAgent: Agent | null;
  availableAgents: Agent[];
  onAgentChange: (agent: Agent) => void;
  settings: ChatSettings;
  onSave: (settings: ChatSettings) => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  isOpen,
  onClose,
  conversation,
  selectedAgent,
  availableAgents,
  onAgentChange,
  settings,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formSettings, setFormSettings] = useState<ChatSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    setFormSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormSettings(settings);
    setHasChanges(false);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(formSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setFormSettings({ ...formSettings, ...importedSettings });
          setHasChanges(true);
        } catch (error) {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'model', label: 'AI Model', icon: Bot },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Chat Settings</h2>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportSettings}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Settings</span>
                </button>
                <label className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Import Settings</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Preferences</h3>
                  
                  {/* Theme */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor }
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.value}
                            onClick={() => handleSettingChange('theme', theme.value)}
                            className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                              formSettings.theme === theme.value
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm">{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Languages className="w-4 h-4 inline mr-2" />
                      Language
                    </label>
                    <select
                      value={formSettings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' }
                      ].map((size) => (
                        <button
                          key={size.value}
                          onClick={() => handleSettingChange('fontSize', size.value)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            formSettings.fontSize === size.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className={`font-medium ${
                            size.value === 'small' ? 'text-sm' : 
                            size.value === 'large' ? 'text-lg' : 'text-base'
                          }`}>
                            {size.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4">
                    {[
                      { key: 'soundEnabled', label: 'Sound Effects', icon: Volume2, description: 'Play sounds for notifications and actions' },
                      { key: 'notificationsEnabled', label: 'Notifications', icon: Bell, description: 'Show desktop notifications for new messages' },
                      { key: 'autoSave', label: 'Auto Save', icon: Save, description: 'Automatically save conversations' },
                      { key: 'showTypingIndicator', label: 'Typing Indicator', icon: Eye, description: 'Show when AI is generating response' }
                    ].map((setting) => {
                      const Icon = setting.icon;
                      return (
                        <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{setting.label}</div>
                              <div className="text-sm text-gray-500">{setting.description}</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formSettings[setting.key as keyof ChatSettings] as boolean}
                              onChange={(e) => handleSettingChange(setting.key as keyof ChatSettings, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Model Settings */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI Model Configuration</h3>
                  
                  {/* Default Agent */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bot className="w-4 h-4 inline mr-2" />
                      Default AI Agent
                    </label>
                    <select
                      value={formSettings.defaultAgent || ''}
                      onChange={(e) => {
                        const agent = availableAgents.find(a => a.id === e.target.value);
                        if (agent) {
                          onAgentChange(agent);
                          handleSettingChange('defaultAgent', e.target.value ? parseInt(e.target.value) : null);
                        }
                      }}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select an agent...</option>
                      {availableAgents.filter(agent => agent.is_active).map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.model_provider} - {agent.model_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature: {formSettings.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formSettings.temperature}
                        onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tokens: {formSettings.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="4000"
                        step="100"
                        value={formSettings.maxTokens}
                        onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Short</span>
                        <span>Long</span>
                      </div>
                    </div>

                    {/* Top P */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Top P: {formSettings.topP}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formSettings.topP}
                        onChange={(e) => handleSettingChange('topP', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Frequency Penalty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency Penalty: {formSettings.frequencyPenalty}
                      </label>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={formSettings.frequencyPenalty}
                        onChange={(e) => handleSettingChange('frequencyPenalty', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      System Prompt
                    </label>
                    <textarea
                      value={formSettings.systemPrompt}
                      onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter custom system prompt..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      This prompt will be used to customize the AI's behavior and personality.
                    </p>
                  </div>

                  {/* Stop Sequences */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stop Sequences
                    </label>
                    <input
                      type="text"
                      value={formSettings.stopSequences.join(', ')}
                      onChange={(e) => handleSettingChange('stopSequences', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter stop sequences separated by commas..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Sequences where the AI should stop generating text.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Configuration</h3>
                  
                  {/* Advanced Toggles */}
                  <div className="space-y-4">
                    {[
                      { key: 'streamResponses', label: 'Stream Responses', icon: Zap, description: 'Stream AI responses as they are generated' },
                      { key: 'saveConversationHistory', label: 'Save History', icon: Database, description: 'Save conversation history locally' },
                      { key: 'enableAnalytics', label: 'Analytics', icon: Eye, description: 'Enable usage analytics and insights' },
                      { key: 'autoTranslate', label: 'Auto Translate', icon: Globe, description: 'Automatically translate messages to your language' },
                      { key: 'moderationEnabled', label: 'Content Moderation', icon: Shield, description: 'Enable content filtering and safety checks' }
                    ].map((setting) => {
                      const Icon = setting.icon;
                      return (
                        <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{setting.label}</div>
                              <div className="text-sm text-gray-500">{setting.description}</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formSettings[setting.key as keyof ChatSettings] as boolean}
                              onChange={(e) => handleSettingChange(setting.key as keyof ChatSettings, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Numeric Settings */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Conversation Length: {formSettings.maxConversationLength}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={formSettings.maxConversationLength}
                        onChange={(e) => handleSettingChange('maxConversationLength', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum number of messages per conversation</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto Delete After: {formSettings.autoDeleteAfterDays} days
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="365"
                        step="1"
                        value={formSettings.autoDeleteAfterDays}
                        onChange={(e) => handleSettingChange('autoDeleteAfterDays', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <p className="text-xs text-gray-500 mt-1">Automatically delete old conversations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Security</h3>
                  
                  {/* Privacy Toggles */}
                  <div className="space-y-4">
                    {[
                      { key: 'dataSharingEnabled', label: 'Data Sharing', icon: Globe, description: 'Share anonymous usage data to improve the service' },
                      { key: 'anonymousUsage', label: 'Anonymous Mode', icon: Eye, description: 'Use the service without linking to your identity' },
                      { key: 'encryptLocalStorage', label: 'Encrypt Storage', icon: Lock, description: 'Encrypt locally stored conversations and settings' },
                      { key: 'clearDataOnExit', label: 'Clear on Exit', icon: Trash2, description: 'Clear all data when closing the application' }
                    ].map((setting) => {
                      const Icon = setting.icon;
                      return (
                        <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{setting.label}</div>
                              <div className="text-sm text-gray-500">{setting.description}</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formSettings[setting.key as keyof ChatSettings] as boolean}
                              onChange={(e) => handleSettingChange(setting.key as keyof ChatSettings, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-8 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-red-900">Danger Zone</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-4">
                      These actions are irreversible. Please be careful.
                    </p>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Clear All Conversations
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Reset All Settings
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Account Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 