/**
 * Conversations Sidebar - OpenAI-like chat sidebar
 */

import React, { useState } from 'react';
import { Conversation } from '../types';

interface ConversationsSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  collapsed: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: (title?: string, agentId?: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onToggleCollapse: () => void;
}

export const ConversationsSidebar: React.FC<ConversationsSidebarProps> = ({
  conversations,
  selectedConversation,
  isLoading,
  collapsed,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(conversationId);
    }
    setShowMenu(null);
  };

  if (collapsed) {
    return (
      <div className="conversations-sidebar collapsed">
        <button 
          onClick={onToggleCollapse}
          className="expand-button"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <button 
          onClick={() => onCreateConversation()}
          className="new-chat-button collapsed"
          title="New chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="conversations-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-top">
          <button 
            onClick={onToggleCollapse}
            className="collapse-button"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <button 
            onClick={() => onCreateConversation()}
            className="new-chat-button"
            title="New chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="search-container">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-skeleton">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-item">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-subtitle"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? (
              <>
                <p>No conversations found</p>
                <p className="empty-subtitle">Try a different search term</p>
              </>
            ) : (
              <>
                <p>No conversations yet</p>
                <p className="empty-subtitle">Start a new chat to begin</p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${
                selectedConversation?.id === conversation.id ? 'selected' : ''
              } ${conversation.is_pinned ? 'pinned' : ''}`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3 className="conversation-title">
                    {conversation.is_pinned && (
                      <svg className="pin-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18l-8-8h6V2h4v8h6l-8 8z" clipRule="evenodd" />
                      </svg>
                    )}
                    {conversation.title}
                  </h3>
                  
                  <div className="conversation-actions">
                    <button
                      className="menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === conversation.id ? null : conversation.id);
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {showMenu === conversation.id && (
                      <div className="context-menu">
                        <button 
                          onClick={(e) => handleDeleteClick(e, conversation.id)}
                          className="menu-item delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="conversation-meta">
                  <span className="message-count">{conversation.message_count} messages</span>
                  <span className="last-activity">{formatTime(conversation.last_message_at)}</span>
                </div>
                
                {conversation.agent_name && (
                  <div className="agent-info">
                    <svg className="agent-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="agent-name">{conversation.agent_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="menu-overlay"
          onClick={() => setShowMenu(null)}
        />
      )}
    </div>
  );
}; 