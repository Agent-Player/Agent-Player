/**
 * Chat Interface - Main chat messages and input area
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  Mic,
  Bot,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Zap,
  X,
  File,
  Download,
  Eye,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agent_id?: number;
  attachments?: FileAttachment[];
  ai_confidence?: number;
  response_time_ms?: number;
  total_tokens?: number;
  sentiment_score?: number;
  follow_up_suggestions?: string[];
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Agent {
  id: number;
  name: string;
  model_provider: string;
  model_name: string;
  is_active: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  conversation: Conversation | null;
  messages: Message[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  onSendMessage: (content: string, files?: File[]) => void;
  onOpenSettings: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  messages,
  selectedAgent,
  isLoading,
  onSendMessage,
  onOpenSettings
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [messageInput, adjustTextareaHeight]);

  const handleSend = () => {
    if (!messageInput.trim() || isLoading) return;
    
    onSendMessage(messageInput.trim(), attachments.length > 0 ? attachments : undefined);
    setMessageInput('');
    setAttachments([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score > 0.6) return 'text-green-600';
    if (score < 0.4) return 'text-red-600';
    return 'text-yellow-600';
  };

  const quickActions = [
    {
      id: 'help',
      label: 'Ask for help',
      action: () => setMessageInput('Can you help me with ')
    },
    {
      id: 'explain',
      label: 'Explain something',
      action: () => setMessageInput('Please explain ')
    },
    {
      id: 'create',
      label: 'Create content',
      action: () => setMessageInput('Please create ')
    },
    {
      id: 'analyze',
      label: 'Analyze data',
      action: () => setMessageInput('Please analyze ')
    }
  ];

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Chat</h3>
          <p className="text-gray-600">Select a conversation or start a new one to begin chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-emerald-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {selectedAgent?.name || 'AI Assistant'}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedAgent?.model_name || 'No agent selected'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Quick Actions"
          >
            <Zap className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Chat Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      {showQuickActions && (
        <div className="p-3 border-b bg-gray-50">
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">Send a message to begin chatting with your AI assistant</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Header */}
                <div className={`flex items-center space-x-2 mb-1 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'agent' && (
                    <div className="flex items-center space-x-1">
                      <Bot className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-gray-600 font-medium">
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className={`relative px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>

                  {/* File Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded-lg">
                          {getFileIcon(attachment.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                          </div>
                          <button className="p-1 hover:bg-black hover:bg-opacity-10 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Performance Metrics */}
                  {message.sender === 'agent' && (message.ai_confidence || message.response_time_ms || message.total_tokens) && (
                    <div className="mt-2 space-y-1">
                      {message.ai_confidence && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className="h-1 rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${message.ai_confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {(message.ai_confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {message.response_time_ms && (
                          <span>{message.response_time_ms}ms</span>
                        )}
                        {message.total_tokens && (
                          <span>{message.total_tokens} tokens</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sentiment & Follow-up */}
                {message.sender === 'agent' && (
                  <>
                    {/* Sentiment Score */}
                    {message.sentiment_score && (
                      <div className="mt-1 flex items-center space-x-2 text-xs">
                        <span className={`flex items-center space-x-1 ${getSentimentColor(message.sentiment_score)}`}>
                          <span>😊</span>
                          <span>{(message.sentiment_score * 100).toFixed(0)}%</span>
                        </span>
                      </div>
                    )}

                    {/* Follow-up Suggestions */}
                    {message.follow_up_suggestions && message.follow_up_suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.follow_up_suggestions.slice(0, 2).map((suggestion, index) => (
                          <button
                            key={index}
                            className="block w-full text-left text-xs text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                            onClick={() => setMessageInput(suggestion)}
                          >
                            💡 {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Message Actions */}
                <div className={`mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3 text-gray-500" />
                  </button>
                  {message.sender === 'agent' && (
                    <>
                      <button
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Good response"
                      >
                        <ThumbsUp className="w-3 h-3 text-gray-500" />
                      </button>
                      <button
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Poor response"
                      >
                        <ThumbsDown className="w-3 h-3 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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
                {getFileIcon(file.type)}
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
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
          />
          
          <div className="flex space-x-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Upload image"
            >
              <Image className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
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
  );
}; 