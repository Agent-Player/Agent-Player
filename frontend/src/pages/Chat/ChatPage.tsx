/**
 * Chat Page - Modern OpenAI-like Chat Interface
 * Features: Conversations sidebar, model selection, chat interface, settings
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConversationsSidebar } from './components/ConversationsSidebar';
import { ChatInterface } from './components/ChatInterface';
import { ModelSelector } from './components/ModelSelector';
import { ChatSettings } from './components/ChatSettings';
import { useAuth } from '../../hooks/useAuth';
import { chatService, agentsService } from '../../services';
import './ChatPage.css';

// Import icons
import {
  Send, Paperclip, Image, Bot, Settings, Plus, Search, Pin, Trash2, Edit3,
  Menu, X, Copy, ThumbsUp, ThumbsDown, Zap, File, Download, Mic, Volume2,
  Eye, Moon, Sun, Monitor, Languages, Bell, Save, RotateCcw, Upload,
  Sliders, Globe, Shield, Database, Lock, AlertTriangle, FileText,
  MessageSquare, Archive, MoreVertical, Smile, Calendar, Clock,
  Users, Code, Terminal, Folder, Link, Bookmark, Star, Heart,
  RefreshCw, Filter, SortDesc, CheckCircle, Circle, Pause, Play
} from 'lucide-react';

// Enhanced Types
interface Agent {
  id: number;
  name: string;
  description?: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  title: string;
  agent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
  is_pinned?: boolean;
  last_message?: string;
  message_count?: number;
  tags?: string[];
  folder?: string;
}

interface Message {
  id: number;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  attachments?: FileAttachment[];
  metadata?: {
    tokens?: number;
    response_time?: number;
    confidence?: number;
    model_used?: string;
    cost?: number;
  };
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
}

interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  capabilities: string[];
  description?: string;
}

interface ChatSettings {
  // General
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
  
  // AI Model
  defaultAgent: number | null;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  stopSequences: string[];
  
  // Advanced
  streamResponses: boolean;
  saveHistory: boolean;
  enableAnalytics: boolean;
  autoTranslate: boolean;
  contentModeration: boolean;
  maxConversations: number;
  
  // Privacy
  shareData: boolean;
  anonymousUsage: boolean;
  encryptData: boolean;
  autoDeleteAfter: number; // days
  
  // MCP Servers
  mcpServers: MCPServer[];
  enableMCP: boolean;
}

const ChatPage: React.FC = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Core State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Chat Settings
  const [settings, setSettings] = useState<ChatSettings>({
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    soundEnabled: true,
    notificationsEnabled: true,
    autoSave: true,
    defaultAgent: null,
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    systemPrompt: '',
    stopSequences: [],
    streamResponses: true,
    saveHistory: true,
    enableAnalytics: true,
    autoTranslate: false,
    contentModeration: true,
    maxConversations: 100,
    shareData: false,
    anonymousUsage: true,
    encryptData: true,
    autoDeleteAfter: 90,
    mcpServers: [],
    enableMCP: false
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Load data on component mount
  useEffect(() => {
    loadConversations();
    loadAgents();
    loadSettings();
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load conversation messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [messageInput]);
  
  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      setConversations(response.conversations || []);
      
      // Load specific conversation if chatId provided
      if (chatId && response.conversations) {
        const conversation = response.conversations.find((c: Conversation) => c.id === chatId);
        if (conversation) {
          setCurrentConversation(conversation);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [chatId]);
  
  // Load agents
  const loadAgents = useCallback(async () => {
    try {
      const response = await agentsService.getAgents();
      setAgents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  }, []);
  
  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };
  
  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('chatSettings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Save settings to localStorage
  const saveSettings = (newSettings: ChatSettings) => {
    try {
      localStorage.setItem('chatSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  // Create new conversation
  const createConversation = async () => {
    try {
      const response = await chatService.createConversation({
        title: 'New Chat',
        agent_id: settings.defaultAgent || undefined
      });
      
      if (response.success && response.data) {
        const newConversation = response.data;
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
        setMessages([]);
        navigate(`/chat/${newConversation.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to create conversation');
    }
  };
  
  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    if (!currentConversation) {
      await createConversation();
      return;
    }
    
    const messageText = messageInput.trim();
    const files = [...selectedFiles];
    
    // Clear input
    setMessageInput('');
    setSelectedFiles([]);
    setShowFileUpload(false);
    
    // Create user message
    const userMessage: Message = {
      id: Date.now(),
      conversation_id: currentConversation.id,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      status: 'sending',
      attachments: files.map(file => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      }))
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Send message to backend
      const response = await chatService.sendMessage(currentConversation.id, {
        content: messageText,
        attachments: files
      });
      
      if (response.success && response.data) {
        // Update user message status
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent', id: response.data.user_message.id }
            : msg
        ));
        
        // Add AI response
        const aiMessage: Message = {
          id: response.data.ai_response.id,
          conversation_id: currentConversation.id,
          role: 'assistant',
          content: response.data.ai_response.content,
          timestamp: response.data.ai_response.timestamp,
          metadata: response.data.ai_response.metadata
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Update conversation title if it's the first message
        if (messages.length === 0) {
          const updatedConversation = {
            ...currentConversation,
            title: messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '')
          };
          setCurrentConversation(updatedConversation);
          setConversations(prev => prev.map(c => 
            c.id === currentConversation.id ? updatedConversation : c
          ));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
      setError('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setShowFileUpload(true);
  };
  
  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setShowFileUpload(false);
    }
  };
  
  // Toggle conversation pin
  const togglePin = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const updatedConversation = { ...conversation, is_pinned: !conversation.is_pinned };
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? updatedConversation : c
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };
  
  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await chatService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort conversations (pinned first, then by date)
  const sortedConversations = filteredConversations.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  
  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={16} />;
    if (fileType.includes('pdf')) return <FileText size={16} />;
    if (fileType.includes('document') || fileType.includes('word')) return <FileText size={16} />;
    return <File size={16} />;
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`chat-page ${settings.theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} />
          </button>
          
          {!sidebarCollapsed && (
            <>
              <button className="new-chat-btn" onClick={createConversation}>
                <Plus size={20} />
                <span>New Chat</span>
              </button>
              
              <button 
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                <Settings size={20} />
              </button>
            </>
          )}
        </div>
        
        {!sidebarCollapsed && (
          <>
            {/* Search */}
            <div className="search-container">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            {/* Conversations List */}
            <div className="conversations-list">
              {loading && <div className="loading">Loading conversations...</div>}
              
              {sortedConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentConversation(conversation);
                    navigate(`/chat/${conversation.id}`);
                  }}
                >
                  <div className="conversation-content">
                    <div className="conversation-title">
                      {conversation.is_pinned && <Pin size={12} className="pin-icon" />}
                      <MessageSquare size={14} />
                      <span>{conversation.title}</span>
                    </div>
                    <div className="conversation-meta">
                      <span className="conversation-date">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </span>
                      {conversation.message_count && (
                        <span className="message-count">{conversation.message_count}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="conversation-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(conversation.id);
                      }}
                      className={`action-btn ${conversation.is_pinned ? 'pinned' : ''}`}
                      title={conversation.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="action-btn delete"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {!loading && sortedConversations.length === 0 && (
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <p>No conversations yet</p>
                  <p>Start a new chat to get started</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-main">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-info">
                <div className="chat-title">
                  <Bot size={20} />
                  <span>{currentConversation.title}</span>
                </div>
                <div className="chat-meta">
                  {currentConversation.agent_id && (
                    <span className="agent-info">
                      {agents.find(a => a.id === currentConversation.agent_id)?.name || 'Unknown Agent'}
                    </span>
                  )}
                  <span className="message-count">{messages.length} messages</span>
                </div>
              </div>
              
              <div className="chat-actions">
                <button
                  onClick={() => togglePin(currentConversation.id)}
                  className={`action-btn ${currentConversation.is_pinned ? 'pinned' : ''}`}
                  title={currentConversation.is_pinned ? 'Unpin' : 'Pin'}
                >
                  <Pin size={18} />
                </button>
                
                <button
                  onClick={() => setShowSettings(true)}
                  className="action-btn"
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
                
                <button
                  onClick={() => deleteConversation(currentConversation.id)}
                  className="action-btn delete"
                  title="Delete conversation"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="messages-container">
              <div className="messages-list">
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-avatar">
                      {message.role === 'user' ? (
                        <div className="user-avatar">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>
                    
                    <div className="message-content">
                      <div className="message-header">
                        <span className="sender-name">
                          {message.role === 'user' ? user?.username || 'You' : 'Assistant'}
                        </span>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        {message.status && (
                          <span className={`message-status ${message.status}`}>
                            {message.status === 'sending' && <Clock size={12} />}
                            {message.status === 'sent' && <CheckCircle size={12} />}
                            {message.status === 'error' && <AlertTriangle size={12} />}
                          </span>
                        )}
                      </div>
                      
                      <div className="message-text">
                        {message.content}
                      </div>
                      
                      {/* File Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="message-attachments">
                          {message.attachments.map(attachment => (
                            <div key={attachment.id} className="attachment">
                              {getFileIcon(attachment.type)}
                              <span className="attachment-name">{attachment.name}</span>
                              <span className="attachment-size">
                                {formatFileSize(attachment.size)}
                              </span>
                              <button
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="attachment-download"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message Metadata */}
                      {message.metadata && (
                        <div className="message-metadata">
                          {message.metadata.tokens && (
                            <span className="metadata-item">
                              <Zap size={12} />
                              {message.metadata.tokens} tokens
                            </span>
                          )}
                          {message.metadata.response_time && (
                            <span className="metadata-item">
                              <Clock size={12} />
                              {message.metadata.response_time.toFixed(2)}s
                            </span>
                          )}
                          {message.metadata.confidence && (
                            <span className="metadata-item">
                              <ThumbsUp size={12} />
                              {(message.metadata.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="message-actions">
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="action-btn"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        {message.role === 'assistant' && (
                          <>
                            <button className="action-btn" title="Like">
                              <ThumbsUp size={14} />
                            </button>
                            <button className="action-btn" title="Dislike">
                              <ThumbsDown size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message assistant typing">
                    <div className="message-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* File Upload Preview */}
            {showFileUpload && selectedFiles.length > 0 && (
              <div className="file-upload-preview">
                <div className="files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      {getFileIcon(file.type)}
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="remove-file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input Area */}
            <div className="chat-input-area">
              <div className="input-container">
                <div className="input-actions">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="action-btn"
                    title="Attach file"
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="action-btn"
                    title="Upload image"
                  >
                    <Image size={20} />
                  </button>
                  
                  <button className="action-btn" title="Voice message">
                    <Mic size={20} />
                  </button>
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message here... (Shift+Enter for new line)"
                  className="message-input"
                  disabled={loading}
                />
                
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() && selectedFiles.length === 0}
                  className="send-btn"
                  title="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="quick-actions">
                <button className="quick-action">📝 Summarize</button>
                <button className="quick-action">🔍 Analyze</button>
                <button className="quick-action">💡 Explain</button>
                <button className="quick-action">🐛 Debug</button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="welcome-screen">
            <div className="welcome-content">
              <Bot size={64} className="welcome-icon" />
              <h1>Welcome to DPRO AI Chat</h1>
              <p>Start a conversation with our AI assistants</p>
              
              <div className="welcome-features">
                <div className="feature">
                  <Upload size={24} />
                  <h3>File Upload</h3>
                  <p>Upload images, documents, and code files</p>
                </div>
                <div className="feature">
                  <Bot size={24} />
                  <h3>Multiple Agents</h3>
                  <p>Choose from different AI models and agents</p>
                </div>
                <div className="feature">
                  <Globe size={24} />
                  <h3>MCP Integration</h3>
                  <p>Connect external tools and services</p>
                </div>
                <div className="feature">
                  <Settings size={24} />
                  <h3>Customizable</h3>
                  <p>Adjust settings to match your preferences</p>
                </div>
              </div>
              
              <button onClick={createConversation} className="start-chat-btn">
                <Plus size={20} />
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv,.py,.js,.tsx,.jsx,.html,.css,.md"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Settings Modal */}
      {showSettings && (
        <ChatSettingsModal
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
          agents={agents}
        />
      )}
      
      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Settings Modal Component
interface ChatSettingsModalProps {
  settings: ChatSettings;
  onSave: (settings: ChatSettings) => void;
  onClose: () => void;
  agents: Agent[];
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ settings, onSave, onClose, agents }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
  
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };
  
  const updateSetting = (key: keyof ChatSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Chat Settings</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Settings size={16} />
            General
          </button>
          <button
            className={`tab ${activeTab === 'model' ? 'active' : ''}`}
            onClick={() => setActiveTab('model')}
          >
            <Bot size={16} />
            AI Model
          </button>
          <button
            className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <Sliders size={16} />
            Advanced
          </button>
          <button
            className={`tab ${activeTab === 'mcp' ? 'active' : ''}`}
            onClick={() => setActiveTab('mcp')}
          >
            <Globe size={16} />
            MCP Servers
          </button>
          <button
            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={16} />
            Privacy
          </button>
        </div>
        
        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              
              <div className="setting-group">
                <label>Theme</label>
                <select
                  value={localSettings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div className="setting-group">
                <label>Language</label>
                <select
                  value={localSettings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              
              <div className="setting-group">
                <label>Font Size</label>
                <select
                  value={localSettings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  />
                  Enable sound effects
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.notificationsEnabled}
                    onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
                  />
                  Enable notifications
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.autoSave}
                    onChange={(e) => updateSetting('autoSave', e.target.checked)}
                  />
                  Auto-save conversations
                </label>
              </div>
            </div>
          )}
          
          {activeTab === 'model' && (
            <div className="settings-section">
              <h3>AI Model Settings</h3>
              
              <div className="setting-group">
                <label>Default Agent</label>
                <select
                  value={localSettings.defaultAgent || ''}
                  onChange={(e) => updateSetting('defaultAgent', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select an agent...</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.model_provider})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="setting-group">
                <label>Temperature: {localSettings.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => updateSetting('temperature', Number(e.target.value))}
                />
              </div>
              
              <div className="setting-group">
                <label>Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  max="32000"
                  value={localSettings.maxTokens}
                  onChange={(e) => updateSetting('maxTokens', Number(e.target.value))}
                />
              </div>
              
              <div className="setting-group">
                <label>Top P: {localSettings.topP}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSettings.topP}
                  onChange={(e) => updateSetting('topP', Number(e.target.value))}
                />
              </div>
              
              <div className="setting-group">
                <label>System Prompt</label>
                <textarea
                  value={localSettings.systemPrompt}
                  onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                  placeholder="Enter system prompt..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'advanced' && (
            <div className="settings-section">
              <h3>Advanced Settings</h3>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.streamResponses}
                    onChange={(e) => updateSetting('streamResponses', e.target.checked)}
                  />
                  Stream responses
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.saveHistory}
                    onChange={(e) => updateSetting('saveHistory', e.target.checked)}
                  />
                  Save chat history
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.enableAnalytics}
                    onChange={(e) => updateSetting('enableAnalytics', e.target.checked)}
                  />
                  Enable analytics
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.autoTranslate}
                    onChange={(e) => updateSetting('autoTranslate', e.target.checked)}
                  />
                  Auto-translate messages
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.contentModeration}
                    onChange={(e) => updateSetting('contentModeration', e.target.checked)}
                  />
                  Content moderation
                </label>
              </div>
              
              <div className="setting-group">
                <label>Max Conversations</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={localSettings.maxConversations}
                  onChange={(e) => updateSetting('maxConversations', Number(e.target.value))}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'mcp' && (
            <div className="settings-section">
              <h3>MCP Server Integration</h3>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.enableMCP}
                    onChange={(e) => updateSetting('enableMCP', e.target.checked)}
                  />
                  Enable MCP Server connections
                </label>
              </div>
              
              <div className="mcp-servers">
                <h4>Connected Servers</h4>
                {localSettings.mcpServers.length === 0 ? (
                  <div className="empty-state">
                    <Terminal size={32} />
                    <p>No MCP servers connected</p>
                    <button className="btn-primary">
                      <Plus size={16} />
                      Add Server
                    </button>
                  </div>
                ) : (
                  localSettings.mcpServers.map(server => (
                    <div key={server.id} className="mcp-server">
                      <div className="server-info">
                        <h5>{server.name}</h5>
                        <p>{server.url}</p>
                        <span className={`status ${server.status}`}>
                          {server.status}
                        </span>
                      </div>
                      <div className="server-actions">
                        <button className="btn-secondary">Edit</button>
                        <button className="btn-danger">Remove</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy Settings</h3>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.shareData}
                    onChange={(e) => updateSetting('shareData', e.target.checked)}
                  />
                  Share data for improvement
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.anonymousUsage}
                    onChange={(e) => updateSetting('anonymousUsage', e.target.checked)}
                  />
                  Anonymous usage analytics
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={localSettings.encryptData}
                    onChange={(e) => updateSetting('encryptData', e.target.checked)}
                  />
                  Encrypt stored data
                </label>
              </div>
              
              <div className="setting-group">
                <label>Auto-delete after (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={localSettings.autoDeleteAfter}
                  onChange={(e) => updateSetting('autoDeleteAfter', Number(e.target.value))}
                />
              </div>
              
              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <button className="btn-danger">
                  <Trash2 size={16} />
                  Clear All Data
                </button>
                <button className="btn-danger">
                  <Database size={16} />
                  Export Data
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="settings-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 