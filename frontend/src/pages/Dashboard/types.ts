export type ActiveTab =
  | "overview"
  | "analytics"
  | "network"
  | "system"
  | "settings";

export interface DashboardStats {
  agents: {
    total: number;
    active: number;
    training: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
  };
  chats: {
    total: number;
    today: number;
    thisWeek: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    apiCalls: number;
    childAgentsActive: number;
  };
  notifications: {
    unread: number;
  };
}

export interface DashboardConfig {
  showQuickActions: boolean;
  showRecentActivity: boolean;
  showSystemMetrics: boolean;
  refreshInterval: number;
}

export interface QuickAction {
  icon: string;
  label: string;
  color: string;
  path: string;
}
