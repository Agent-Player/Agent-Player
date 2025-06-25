/**
 * Main Chat Page
 * Shows list of conversations and allows creating new chats
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MessageCircle,
  Plus,
  Search,
  Bot,
  Clock,
  AlertTriangle,
  RefreshCw,
  Send,
  User,
  Sparkles,
  Settings,
  MoreVertical
} from 'lucide-react';

import chatService from '../../services/chatService';
import agentsService from '../../services/agents';

// Simple working types
interface SimpleConversation {
  id: number;
  title: string;
  agent_id?: number;
  message_count: number;
  created_at: string;
  updated_at?: string;
  last_message_at?: string;
  is_active?: boolean;
}

interface SimpleMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  tokens_used?: number;
  sender_type?: string;
  user_id?: number;
}

interface SimpleAgent {
  id: number;
  name: string;
  description?: string;
  model_name: string;
  model_provider?: string;
  is_active?: boolean;
}

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  
  // State management
  const [conversations, setConversations] = useState<SimpleConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SimpleConversation | null>(null);
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [availableAgents, setAvailableAgents] = useState<SimpleAgent[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadConversations();
    loadAgents();
  }, []);

  // Load specific conversation if ID provided
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === parseInt(conversationId));
      if (conversation) {
        selectConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  const loadConversations = async () => {
    try {
      setError(null);
      console.log('🔄 Loading conversations...');
      
      const data = await chatService.getConversations();
      console.log('📦 Conversations response:', data);
      
      // Convert to simple format
      const simpleConversations: SimpleConversation[] = Array.isArray(data) 
        ? data.map(conv => ({
            id: conv.id,
            title: conv.title,
            agent_id: conv.agent_id,
            message_count: conv.message_count || 0,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            last_message_at: conv.last_message_at,
            is_active: conv.is_active
          }))
        : [];
      
      setConversations(simpleConversations);
      console.log(`✅ Loaded ${simpleConversations.length} conversations`);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const data = await agentsService.getAgents();
      
             // Convert to simple format
       const simpleAgents: SimpleAgent[] = Array.isArray(data)
         ? data.map((agent: { id: number; name: string; description?: string; model_name?: string; model_provider?: string; is_active?: boolean }) => ({
            id: agent.id,
            name: agent.name,
            description: agent.description,
            model_name: agent.model_name || agent.model_provider || 'Unknown',
            model_provider: agent.model_provider,
            is_active: agent.is_active !== false
          }))
        : [];
      
      setAvailableAgents(simpleAgents.filter(agent => agent.is_active));
      console.log(`✅ Loaded ${simpleAgents.length} agents`);
    } catch (error) {
      console.error('❌ Error loading agents:', error);
    }
  };

  const selectConversation = async (conversation: SimpleConversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    setMessageError(null);
    
    try {
      console.log('📂 Loading messages for conversation:', conversation.id);
      const data = await chatService.getMessages(conversation.id);
      
      // Convert to simple format
      const simpleMessages: SimpleMessage[] = Array.isArray(data)
        ? data.map(msg => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            role: msg.role,
            content: msg.content,
            created_at: msg.created_at,
            tokens_used: msg.tokens_used,
            sender_type: msg.sender_type,
            user_id: msg.user_id
          }))
        : [];
      
      setMessages(simpleMessages);
      console.log(`✅ Loaded ${simpleMessages.length} messages`);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setMessageError('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const createNewConversation = async (agentId?: number) => {
    setIsCreatingChat(true);
    setError(null);
    
    try {
      console.log('🆕 Creating new conversation with agent:', agentId);
      
      const newConv = await chatService.createConversation({
        title: `New Chat ${new Date().toLocaleTimeString()}`,
        agent_id: agentId
      });
      
      console.log('✅ Created conversation:', newConv);
      
      // Refresh conversations list
      await loadConversations();
      
      // Select the new conversation
      if (newConv && newConv.id) {
        navigate(`/dashboard/chat/${newConv.id}`);
      }
      
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      setError('Failed to create new chat');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedConversation || isSendingMessage) {
      return;
    }

    setIsSendingMessage(true);
    setMessageError(null);
    const messageText = currentMessage.trim();
    setCurrentMessage('');

    try {
      console.log('📤 Sending message:', messageText);
      
      // Add user message to UI immediately
      const tempUserMessage: SimpleMessage = {
        id: Date.now(), // Temporary ID
        conversation_id: selectedConversation.id,
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString(),
        sender_type: 'user',
        user_id: 1
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      
      // Send to backend
      const response = await chatService.sendMessage(selectedConversation.id, {
        content: messageText
      });
      
      // Handle response - it's already the data we need
      if (response) {
        const userMsg = response.user_message;
        const agentMsg = response.ai_response;
        
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMessage.id);
          const newMessages: SimpleMessage[] = [];
          
          if (userMsg) {
            newMessages.push({
              id: userMsg.id,
              conversation_id: userMsg.conversation_id,
              role: userMsg.role,
              content: userMsg.content,
              created_at: userMsg.created_at,
              tokens_used: userMsg.tokens_used,
              sender_type: userMsg.sender_type,
              user_id: userMsg.user_id
            });
          }
          
          if (agentMsg) {
            newMessages.push({
              id: agentMsg.id,
              conversation_id: agentMsg.conversation_id,
              role: agentMsg.role,
              content: agentMsg.content,
              created_at: agentMsg.created_at,
              tokens_used: agentMsg.tokens_used,
              sender_type: agentMsg.sender_type,
              user_id: agentMsg.user_id
            });
          }
          
          return [...filtered, ...newMessages];
        });
        
        console.log('✅ Message sent successfully');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessageError('Failed to send message');
      // Remove temporary message on error
      setMessages(prev => prev.filter(m => m.id !== Date.now()));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading Chat Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              Chats
            </h2>
            <button
              onClick={() => createNewConversation()}
              disabled={isCreatingChat}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="New Chat"
            >
              {isCreatingChat ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Quick Actions */}
        {availableAgents.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Start</p>
            <div className="grid grid-cols-1 gap-2">
              {availableAgents.slice(0, 3).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => createNewConversation(agent.id)}
                  className="text-left p-2 rounded-lg hover:bg-white border border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.model_name}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
              <button
                onClick={loadConversations}
                className="ml-auto p-1 hover:bg-red-100 rounded"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start your first chat with an AI agent</p>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{conversation.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.last_message_at || conversation.updated_at || conversation.created_at)}
                      </span>
                      {conversation.message_count > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {conversation.message_count} messages
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {conversation.agent_id && (
                    <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        
        {/* Stats Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">{conversations.length}</p>
              <p className="text-xs text-gray-500">Conversations</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{availableAgents.length}</p>
              <p className="text-xs text-gray-500">Agents</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {conversations.reduce((sum, conv) => sum + conv.message_count, 0)}
              </p>
              <p className="text-xs text-gray-500">Messages</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversation.title}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.agent_id ? (
                        <>🤖 Agent Chat • {messages.length} messages</>
                      ) : (
                        <>💬 Direct Chat • {messages.length} messages</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : messageError ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">{messageError}</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Start a conversation</p>
                    <p className="text-sm text-gray-400 mt-1">Send a message to begin chatting</p>
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md lg:max-w-lg xl:max-w-xl ${
                      message.role === 'user' ? 'order-2' : 'order-1'
                    }`}>
                      <div className={`p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.created_at)}</span>
                          {message.tokens_used && (
                            <span>{message.tokens_used} tokens</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'order-1 bg-blue-600' : 'order-2 bg-gradient-to-br from-green-500 to-blue-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {/* Sending message indicator */}
              {isSendingMessage && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {messageError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{messageError}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isSendingMessage}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMessage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Chat Center</h2>
              <p className="text-gray-600 mb-8">Select a conversation or start a new chat with an AI agent</p>
              
              <button
                onClick={() => createNewConversation()}
                disabled={isCreatingChat}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCreatingChat ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Start New Chat
                  </>
                )}
              </button>
              
              {availableAgents.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm text-gray-500 mb-4">Or chat with a specific agent:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {availableAgents.slice(0, 3).map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => createNewConversation(agent.id)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Bot className="w-5 h-5 text-blue-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.model_name}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 