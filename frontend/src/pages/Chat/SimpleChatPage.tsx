/**
 * Simple Chat Page - OpenAI-like Chat Interface
 * Works directly with existing API without type conflicts
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { chatService, agentsService } from '../../services';
import './ChatPage.css';

import {
  Send,
  Paperclip,
  Image,
  Bot,
  Settings,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Menu,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Zap,
  File,
  Download,
  Mic,
  Volume2,
  Eye,
  Moon,
  Sun,
  Monitor,
  Languages,
  Bell,
  Save,
  RotateCcw,
  Upload,
  Sliders,
  Globe,
  Shield,
  Database,
  Lock,
  AlertTriangle,
  FileText
} from 'lucide-react';

// Default settings
const defaultChatSettings = {
  theme: 'light',
  language: 'en',
  fontSize: 'medium',
  soundEnabled: true,
  notificationsEnabled: true,
  autoSave: true,
  showTypingIndicator: true,
  defaultAgent: null,
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  stopSequences: [],
  systemPrompt: '',
  streamResponses: true,
  saveConversationHistory: true,
  enableAnalytics: false,
  autoTranslate: false,
  moderationEnabled: true,
  maxConversationLength: 100,
  autoDeleteAfterDays: 30,
  dataSharingEnabled: false,
  anonymousUsage: false,
  encryptLocalStorage: true,
  clearDataOnExit: false
};

export const SimpleChatPage: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(defaultChatSettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');

  // Load data
  useEffect(() => {
    loadAgents();
    loadConversations();
    loadSettings();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        loadMessages(conversationId);
      }
    }
  }, [conversationId, conversations]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('chatSettings');
      if (saved) {
        setSettings({ ...defaultChatSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = (newSettings: any) => {
    try {
      localStorage.setItem('chatSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const agentsList = await agentsService.getAgents();
      const activeAgents = Array.isArray(agentsList) ? agentsList.filter((a: any) => a.is_active) : [];
      setAgents(activeAgents);
      if (!selectedAgent && activeAgents.length > 0) {
        setSelectedAgent(activeAgents[0]);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await chatService.getConversations();
      const convList = response.conversations || [];
      setConversations(convList.sort((a: any, b: any) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const response = await chatService.getMessages(convId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!currentConversation || !selectedAgent || !messageInput.trim()) return;

    setIsLoading(true);
    const content = messageInput.trim();
    setMessageInput('');

    try {
      if (attachments.length > 0) {
        await chatService.sendMessageWithFile(currentConversation.id, content, attachments[0]);
        setAttachments([]);
      } else {
        await chatService.sendMessage(currentConversation.id, {
          content,
          sender_type: 'user'
        });
      }
      
      await loadMessages(currentConversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const response = await chatService.createConversation({
        title: 'New Conversation',
        agent_id: selectedAgent?.id
      });
      await loadConversations();
      navigate(`/chat/${response.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await chatService.deleteConversation(convId);
      await loadConversations();
      if (currentConversation?.id === convId) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickActions = [
    { id: 'help', label: 'Ask for help', action: () => setMessageInput('Can you help me with ') },
    { id: 'explain', label: 'Explain something', action: () => setMessageInput('Please explain ') },
    { id: 'create', label: 'Create content', action: () => setMessageInput('Please create ') },
    { id: 'analyze', label: 'Analyze data', action: () => setMessageInput('Please analyze ') }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the chat interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                <button
                  onClick={handleCreateConversation}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="New Conversation"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="mt-3 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    currentConversation?.id === conv.id
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {!sidebarCollapsed ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{conv.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatTimestamp(conv.updated_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <Bot className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-emerald-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentConversation?.title || 'Select a Conversation'}
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedAgent?.name || 'No agent selected'} • {selectedAgent?.model_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Agent Selector */}
              <select
                value={selectedAgent?.id || ''}
                onChange={(e) => {
                  const agent = agents.find(a => a.id === parseInt(e.target.value));
                  setSelectedAgent(agent);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Quick Actions"
              >
                <Zap className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Quick Actions</span>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="ml-auto p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="text-left text-sm p-2 border border-gray-200 rounded-lg hover:bg-white hover:border-emerald-200 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Chat</h3>
                <p className="text-gray-600">Select a conversation or start a new one to begin chatting</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">Send a message to begin chatting with your AI assistant</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message Header */}
                  <div className={`flex items-center space-x-2 mb-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role !== 'user' && (
                      <div className="flex items-center space-x-1">
                        <Bot className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-gray-600 font-medium">AI Assistant</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.created_at)}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`relative px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>

                    {/* Performance Metrics */}
                    {message.role !== 'user' && (message.tokens_used || message.processing_time) && (
                      <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                        {message.processing_time && (
                          <span>{(message.processing_time * 1000).toFixed(0)}ms</span>
                        )}
                        {message.tokens_used && (
                          <span>{message.tokens_used} tokens</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className={`mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <button
                      onClick={() => navigator.clipboard.writeText(message.content)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3 text-gray-500" />
                    </button>
                    {message.role !== 'user' && (
                      <>
                        <button className="p-1 rounded-full hover:bg-gray-100 transition-colors" title="Good response">
                          <ThumbsUp className="w-3 h-3 text-gray-500" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100 transition-colors" title="Poor response">
                          <ThumbsDown className="w-3 h-3 text-gray-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="border-t bg-gray-50 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Attachments ({attachments.length})</span>
            </div>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white border rounded-lg">
                  <File className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <div className="flex items-end space-x-3">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
            />
            
            <div className="flex space-x-1">
              <label
                htmlFor="file-upload"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </label>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voice message">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isLoading}
              className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Settings Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Chat Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Settings Sidebar */}
              <div className="w-64 border-r bg-gray-50 p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'model', label: 'AI Model', icon: Bot },
                    { id: 'advanced', label: 'Advanced', icon: Sliders },
                    { id: 'privacy', label: 'Privacy', icon: Shield }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSettingsTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSettingsTab === tab.id
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
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSettingsTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">General Preferences</h3>
                    
                    {/* Theme Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
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
                              onClick={() => setSettings({...settings, theme: theme.value})}
                              className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                                settings.theme === theme.value
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

                    {/* Other General Settings */}
                    <div className="space-y-4">
                      {[
                        { key: 'soundEnabled', label: 'Sound Effects', description: 'Play sounds for notifications' },
                        { key: 'notificationsEnabled', label: 'Notifications', description: 'Show desktop notifications' },
                        { key: 'autoSave', label: 'Auto Save', description: 'Automatically save conversations' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{setting.label}</div>
                            <div className="text-sm text-gray-500">{setting.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[setting.key as keyof typeof settings] as boolean}
                              onChange={(e) => setSettings({...settings, [setting.key]: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'model' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">AI Model Configuration</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temperature: {settings.temperature}</label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens: {settings.maxTokens}</label>
                      <input
                        type="range"
                        min="100"
                        max="4000"
                        step="100"
                        value={settings.maxTokens}
                        onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Advanced Configuration</h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'streamResponses', label: 'Stream Responses', description: 'Stream AI responses as generated' },
                        { key: 'enableAnalytics', label: 'Analytics', description: 'Enable usage analytics' },
                        { key: 'autoTranslate', label: 'Auto Translate', description: 'Translate messages automatically' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{setting.label}</div>
                            <div className="text-sm text-gray-500">{setting.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[setting.key as keyof typeof settings] as boolean}
                              onChange={(e) => setSettings({...settings, [setting.key]: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Privacy & Security</h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'dataSharingEnabled', label: 'Data Sharing', description: 'Share usage data to improve service' },
                        { key: 'encryptLocalStorage', label: 'Encrypt Storage', description: 'Encrypt local conversations' },
                        { key: 'clearDataOnExit', label: 'Clear on Exit', description: 'Clear data when closing app' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{setting.label}</div>
                            <div className="text-sm text-gray-500">{setting.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[setting.key as keyof typeof settings] as boolean}
                              onChange={(e) => setSettings({...settings, [setting.key]: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveSettings(settings);
                  setShowSettings(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 