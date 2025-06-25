/**
 * Model Selector - Choose AI agent/model for conversation
 */

import React, { useState } from 'react';
import { Agent } from '../types';

interface ModelSelectorProps {
  availableAgents: Agent[];
  selectedAgent: Agent | null;
  onAgentChange: (agent: Agent) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  availableAgents,
  selectedAgent,
  onAgentChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAgentSelect = (agent: Agent) => {
    onAgentChange(agent);
    setIsOpen(false);
  };

  const getModelDisplayName = (agent: Agent) => {
    return `${agent.name} (${agent.model_name})`;
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return '#10B981';
      case 'anthropic':
        return '#8B5CF6';
      case 'google':
        return '#3B82F6';
      case 'cohere':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="model-selector">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="model-selector-button"
          title="Select AI model"
        >
          {selectedAgent ? (
            <div className="selected-model">
              <div className="model-info">
                <div className="model-name">{selectedAgent.name}</div>
                <div className="model-details">
                  <span 
                    className="provider-badge"
                    style={{ backgroundColor: getProviderColor(selectedAgent.model_provider) }}
                  >
                    {selectedAgent.model_provider}
                  </span>
                  <span className="model-version">{selectedAgent.model_name}</span>
                </div>
              </div>
              <svg 
                className={`chevron ${isOpen ? 'open' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            <div className="no-model-selected">
              <span>Select Model</span>
              <svg className="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </button>

        {isOpen && (
          <>
            <div className="model-dropdown">
              <div className="dropdown-header">
                <h3>Choose AI Model</h3>
                <p>Select the AI agent for this conversation</p>
              </div>
              
              <div className="models-list">
                {availableAgents.length === 0 ? (
                  <div className="no-models">
                    <p>No AI agents available</p>
                    <p className="no-models-subtitle">Create an agent first to use the chat</p>
                  </div>
                ) : (
                  availableAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent)}
                      className={`model-option ${
                        selectedAgent?.id === agent.id ? 'selected' : ''
                      } ${!agent.is_active ? 'disabled' : ''}`}
                      disabled={!agent.is_active}
                    >
                      <div className="model-option-content">
                        <div className="model-option-header">
                          <div className="model-option-name">{agent.name}</div>
                          {!agent.is_active && (
                            <span className="inactive-badge">Inactive</span>
                          )}
                          {selectedAgent?.id === agent.id && (
                            <svg className="selected-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="model-option-details">
                          <span 
                            className="provider-badge"
                            style={{ backgroundColor: getProviderColor(agent.model_provider) }}
                          >
                            {agent.model_provider}
                          </span>
                          <span className="model-version">{agent.model_name}</span>
                        </div>
                        
                        {agent.description && (
                          <div className="model-description">
                            {agent.description}
                          </div>
                        )}
                        
                        <div className="model-meta">
                          <span className="created-date">
                            Created {new Date(agent.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="dropdown-footer">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="close-dropdown-button"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div 
              className="dropdown-overlay"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}; 