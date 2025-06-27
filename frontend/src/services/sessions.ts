// Session Service - Frontend Chat Session Management
// All code in English as per project rules

import { API_BASE_URL } from "./api";

export interface ChatSession {
  session_id: string;
  session_name: string;
  conversation_id: string;
  agent_id?: number;
  session_type: string;
  status: string;
  start_time?: string;
  end_time?: string;
  last_activity?: string;
  total_duration: number;
  messages_count: number;
  tokens_used: number;
  cost_incurred: number;
  session_config?: Record<string, unknown>;
  context_data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface SessionHistoryEvent {
  id: number;
  event_type: string;
  event_data: Record<string, unknown>;
  timestamp: string;
  duration?: number;
  message_id?: string;
  agent_id?: number;
  event_metadata?: Record<string, unknown>;
}

export interface SessionAnalytics {
  total_sessions: number;
  active_sessions: number;
  total_messages: number;
  total_tokens: number;
  total_cost: number;
  average_duration: number;
  period_days: number;
}

export interface CreateSessionRequest {
  conversation_id: string;
  agent_id?: number;
  session_name?: string;
  session_type?: string;
}

export interface UpdateSessionRequest {
  session_name?: string;
  status?: string;
  session_config?: Record<string, unknown>;
  context_data?: Record<string, unknown>;
}

export interface SearchSessionsRequest {
  query?: string;
  date_from?: string;
  date_to?: string;
  agent_id?: number;
  skip?: number;
  limit?: number;
}

class SessionService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // SESSION CREATION AND MANAGEMENT

  async createSession(request: CreateSessionRequest): Promise<ChatSession> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to create session" }));
      throw new Error(errorData.message || "Failed to create session");
    }

    const data = await response.json();
    return data.data;
  }

  async getUserSessions(
    skip: number = 0,
    limit: number = 20,
    status?: string,
    sessionType?: string
  ): Promise<{ sessions: ChatSession[]; total: number }> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (status) params.append("status", status);
    if (sessionType) params.append("session_type", sessionType);

    const response = await fetch(`${API_BASE_URL}/chat/sessions?${params}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to fetch sessions" }));
      throw new Error(errorData.message || "Failed to fetch sessions");
    }

    const data = await response.json();
    return {
      sessions: data.data.sessions,
      total: data.data.total,
    };
  }

  async getSessionDetails(sessionId: string): Promise<ChatSession> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Session not found" }));
      throw new Error(errorData.message || "Session not found");
    }

    const data = await response.json();
    return data.data;
  }

  async updateSession(
    sessionId: string,
    updates: UpdateSessionRequest
  ): Promise<ChatSession> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to update session" }));
      throw new Error(errorData.message || "Failed to update session");
    }

    const data = await response.json();
    return data.data;
  }

  async endSession(sessionId: string): Promise<ChatSession> {
    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/${sessionId}/end`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to end session" }));
      throw new Error(errorData.message || "Failed to end session");
    }

    const data = await response.json();
    return data.data;
  }

  // SESSION HISTORY AND TIMELINE

  async getSessionHistory(
    sessionId: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<{ history: SessionHistoryEvent[]; total: number }> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/${sessionId}/history?${params}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to fetch session history" }));
      throw new Error(errorData.message || "Failed to fetch session history");
    }

    const data = await response.json();
    return {
      history: data.data.history,
      total: data.data.total,
    };
  }

  async getSessionTimeline(sessionId: string): Promise<SessionHistoryEvent[]> {
    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/${sessionId}/timeline`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to fetch session timeline" }));
      throw new Error(errorData.message || "Failed to fetch session timeline");
    }

    const data = await response.json();
    return data.data;
  }

  // SESSION ANALYTICS

  async getSessionAnalytics(days: number = 30): Promise<SessionAnalytics> {
    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/analytics?days=${days}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to fetch session analytics" }));
      throw new Error(errorData.message || "Failed to fetch session analytics");
    }

    const data = await response.json();
    return data.data;
  }

  // SESSION SEARCH

  async searchSessions(
    searchParams: SearchSessionsRequest
  ): Promise<{ sessions: ChatSession[]; total: number }> {
    const params = new URLSearchParams();

    if (searchParams.query) params.append("query", searchParams.query);
    if (searchParams.date_from)
      params.append("date_from", searchParams.date_from);
    if (searchParams.date_to) params.append("date_to", searchParams.date_to);
    if (searchParams.agent_id)
      params.append("agent_id", searchParams.agent_id.toString());
    if (searchParams.skip) params.append("skip", searchParams.skip.toString());
    if (searchParams.limit)
      params.append("limit", searchParams.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/search?${params}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to search sessions" }));
      throw new Error(errorData.message || "Failed to search sessions");
    }

    const data = await response.json();
    return {
      sessions: data.data.sessions,
      total: data.data.total,
    };
  }

  // UTILITY METHODS

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
  }

  getSessionStatusColor(status: string): string {
    switch (status) {
      case "active":
        return "#10b981"; // green
      case "paused":
        return "#f59e0b"; // yellow
      case "completed":
        return "#3b82f6"; // blue
      case "ended":
        return "#6b7280"; // gray
      default:
        return "#6b7280";
    }
  }

  getSessionStatusIcon(status: string): string {
    switch (status) {
      case "active":
        return "🟢";
      case "paused":
        return "⏸️";
      case "completed":
        return "✅";
      case "ended":
        return "⏹️";
      default:
        return "❓";
    }
  }
}

export const sessionService = new SessionService();
export default sessionService;
