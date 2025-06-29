import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import WorkflowBoard, { type WorkflowBoardHandle, type ConnectionType } from './components/WorkflowBoard';
import { AnimatedToolbar } from './components/AnimatedToolbar';
import { LogPanel } from './components/LogPanel';
import ModernHelpDialog from './components/ModernHelpDialog';
import { ComponentLibrary } from './components/ComponentLibrary';
import { EnhancedBoardSettings } from './components/EnhancedBoardSettings';
import { ChildAgentChatPanel } from './components/ChildAgentChatPanel';
import './components/boardTheme.css';

interface ChildAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'busy';
  capabilities: string[];
  memory_summary?: string;
}

interface QueueData {
  queueItems: QueueItem[];
  currentProcessingIndex: number;
  isSequentialMode: boolean;
}

interface QueueItem {
  id: string;
  serviceType: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  status: 'pending' | 'current' | 'success' | 'error' | 'warning' | 'completed';
  isDisappearing?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  target?: string;
  message: string;
  details?: Record<string, unknown>;
}

// Simplified panel system - only bottom layout needed

const BoardPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  
  console.log('🎯 BoardPage loaded with agentId:', agentId);
  
  // Memoize initial state
  const initialState = useMemo(() => {
    // Create a more readable board ID using agent ID if available
    const timestamp = Date.now().toString().slice(-6);
    const boardId = agentId 
      ? `BOARD-${agentId}-${timestamp}`
      : `BOARD-${timestamp}`;

    return {
      isInitialized: false,
      boardId,
      boardName: localStorage.getItem('currentBoardName') || 
                 (agentId ? `Agent ${agentId} Board` : 'Training Workflow Board')
    };
  }, [agentId]);

  // State declarations
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [boardName, setBoardName] = useState(initialState.boardName);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ChildAgent | undefined>();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [logHeight, setLogHeight] = useState(400);
  const [liveMode, setLiveMode] = useState(true);
  const [connectionType, setConnectionType] = useState<ConnectionType>('curved');
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [boardId] = useState(initialState.boardId);
  
  // Refs
  const isInitializedRef = useRef(initialState.isInitialized);
  const workflowBoardRef = useRef<WorkflowBoardHandle>(null);

  // Queue data state
  const [queueData, setQueueData] = useState<QueueData>({
    queueItems: [],
    currentProcessingIndex: 0,
    isSequentialMode: true
  });

  // Stable functions
  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 1000));
  }, []);

  // Callback to receive queue updates
  const handleQueueUpdate = (newQueueData: QueueData) => {
    setQueueData(newQueueData);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowChat(!showChat);
      } else if (e.ctrlKey && e.key === '?') {
        e.preventDefault();
        setShowHelpDialog(true);
      } else if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        setShowMinimap(!showMinimap);
      } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setShowLog(!showLog);
      } else if (e.key === 'c' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const types: ConnectionType[] = ['curved', 'straight', 'stepped'];
        const currentIndex = types.indexOf(connectionType);
        const nextType = types[(currentIndex + 1) % types.length];
        handleConnectionTypeChange(nextType);
      } else if (e.key === 'Escape') {
        setShowHelpDialog(false);
        setShowSettings(false);
        setShowChat(false);
        setShowLog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showChat, showMinimap, showLog, connectionType]);

  // Handlers
  const handleToggleComponentLibrary = () => setShowComponentLibrary(!showComponentLibrary);
  const handleConnectionTypeChange = (type: ConnectionType) => {
    setConnectionType(type);
    workflowBoardRef.current?.setConnectionType(type);
  };

  // Log management functions
  const clearLogs = () => {
    setLogs([]);
  };

  // Initialize board using useLayoutEffect to prevent flashing
  useLayoutEffect(() => {
    const initializeBoard = async () => {
      // Skip if already initialized
      if (isInitializedRef.current) {
        console.log('⚡ Board already initialized, skipping...');
        return;
      }

      try {
        console.log(`🎯 Starting board initialization for agent #${agentId}`);
        
        // Mark as initialized immediately
        isInitializedRef.current = true;

        // Simulate loading for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!agentId) {
          console.log('⚠️ No agent ID provided');
          addLog({
            type: 'info',
            source: 'System',
            message: 'Welcome to the Board! Get started by adding components.',
          });
        } else {
          addLog({
            type: 'info',
            source: 'Training System',
            message: `Training Board initialized for Agent #${agentId}`,
            details: { boardId, agentId, boardType: 'training' }
          });
          
          addLog({
            type: 'success',
            source: 'Training System',
            message: 'Ready to build AI agent training workflows',
            details: { instructions: 'Use the component library on the left to add workflow elements' }
          });
        }
      } catch (error) {
        console.error('Error initializing board:', error);
        addLog({
          type: 'error',
          source: 'System',
          message: 'Failed to initialize board',
          details: { error: String(error) }
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeBoard();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up board...');
      isInitializedRef.current = false;
    };
  }, [agentId, addLog, boardId]);

  // Handle WebSocket connection error gracefully
  useEffect(() => {
    const handleWebSocketError = (event: ErrorEvent) => {
      if (event.message.includes('WebSocket')) {
        console.log('💡 WebSocket connection failed - continuing in offline mode');
        addLog({
          type: 'warning',
          source: 'System',
          message: 'WebSocket connection failed - continuing in offline mode',
          details: { feature: 'real-time updates disabled' }
        });
      }
    };

    window.addEventListener('error', handleWebSocketError);
    return () => window.removeEventListener('error', handleWebSocketError);
  }, [addLog]);

  // Save board name to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currentBoardName', boardName);
    console.log('💾 Board name saved to storage:', boardName);
  }, [boardName]);

  // Add board info to logs on initialization
  useEffect(() => {
    if (!isLoading) {
      addLog({
        type: 'info',
        source: 'System',
        message: `Board Information`,
        details: { 
          boardId: boardId,
          agentId: agentId || 'None',
          type: agentId ? 'Training Board' : 'Generic Board',
          created: new Date().toISOString()
        }
      });
    }
  }, [isLoading, boardId, agentId, addLog]);

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          fontSize: '24px',
          color: 'white',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {agentId ? (
            <>
              <div>🎓 Initializing Training Board</div>
              <div style={{ fontSize: '16px', opacity: 0.8, marginTop: '8px' }}>
                Preparing workspace for Agent #{agentId}
              </div>
            </>
          ) : (
            <>
              <div>🎯 Loading Board</div>
              <div style={{ fontSize: '16px', opacity: 0.8, marginTop: '8px' }}>
                Setting up your workspace
              </div>
            </>
          )}
        </div>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Simplified panel management - no complex layouts needed

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Animated Toolbar */}
      <AnimatedToolbar
        boardName={boardName}
        setBoardName={setBoardName}
        agentId={agentId}
        connectionType={connectionType}
        onConnectionTypeChange={handleConnectionTypeChange}
        onToggleComponentLibrary={handleToggleComponentLibrary}
        onUndo={() => workflowBoardRef.current?.handleUndo()}
        onRedo={() => workflowBoardRef.current?.handleRedo()}
        onZoomOut={() => workflowBoardRef.current?.handleZoomOut()}
        onZoomIn={() => workflowBoardRef.current?.handleZoomIn()}
        onResetZoom={() => workflowBoardRef.current?.handleResetZoom()}
        onFitToScreen={() => workflowBoardRef.current?.handleFitToScreen()}
        onExport={() => workflowBoardRef.current?.handleExport()}
        onImport={(e) => workflowBoardRef.current?.handleImport(e)}
        onToggleSettings={() => setShowSettings(!showSettings)}
        liveMode={liveMode}
        onToggleLiveMode={() => setLiveMode(!liveMode)}
        showChat={showChat}
        onToggleChat={() => setShowChat(!showChat)}
      />

      {/* Main Board Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
      }}>
        <WorkflowBoard
          ref={workflowBoardRef}
          boardId={boardId}
          onToggleLog={() => setShowLog(!showLog)}
          showLog={showLog}
          onToggleHelp={() => setShowHelpDialog(true)}
          liveMode={liveMode}
          onQueueUpdate={handleQueueUpdate}
          onAddLog={addLog}
        />

        {/* Agent Training Board Info - Show when we have an agentId */}
        {agentId && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(102, 126, 234, 0.9)',
            color: 'white',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            🎓 Training Board for Agent #{agentId}
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
              Build workflows to train your AI agent
            </div>
          </div>
        )}

        {/* Component Library - Fixed Left Sidebar */}
        {showComponentLibrary && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '350px',
            zIndex: 1000,
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
          }}>
                         <ComponentLibrary 
               isOpen={showComponentLibrary}
               onClose={() => setShowComponentLibrary(false)}
            />
          </div>
        )}

        {/* Enhanced Board Settings - Real Settings Panel */}
        {showSettings && (
          <EnhancedBoardSettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            boardName={boardName}
            setBoardName={setBoardName}
            connectionType={connectionType}
            onConnectionTypeChange={handleConnectionTypeChange}
          />
        )}

        {/* Modern Help Dialog */}
        <ModernHelpDialog
          open={showHelpDialog}
          onClose={() => setShowHelpDialog(false)}
        />

        {/* Panels - Bottom Layout */}
        {(showLog || showChat) && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${logHeight}px`,
            zIndex: 500,
            display: 'flex',
            borderTop: '1px solid #ddd',
            background: '#f8f9fa',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            {showChat && (
              <div style={{
                flex: showLog && showChat ? '1 1 50%' : '1',
                borderRight: showLog && showChat ? '1px solid #ddd' : 'none',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <ChildAgentChatPanel
                  isOpen={showChat}
                  onClose={() => setShowChat(false)}
                  selectedAgent={selectedAgent}
                  onAgentSelect={(agent: ChildAgent) => setSelectedAgent(agent)}
                  boardId={boardId}
                  isBottomPanel={true}
                />
              </div>
            )}
            {showLog && (
              <div style={{
                flex: showLog && showChat ? '1 1 50%' : '1',
                background: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <LogPanel
                  isOpen={showLog}
                  onClose={() => setShowLog(false)}
                  height={logHeight}
                  onHeightChange={setLogHeight}
                  logs={logs}
                  onClearLogs={clearLogs}
                  queueItems={queueData.queueItems}
                  currentProcessingIndex={queueData.currentProcessingIndex}
                  isSequentialMode={queueData.isSequentialMode}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardPage;