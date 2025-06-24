import api from "./api";
import type {
  TrainingWorkspace,
  TrainingSession,
  TrainingAnalytics,
  TrainingTemplate,
  WorkspaceTestResult,
} from "../types/trainingLab";

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  agent_id: number;
  workspace_data_json: any;
  tags?: string[];
  is_public?: boolean;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  workspace_data_json?: any;
  tags?: string[];
  is_public?: boolean;
}

export interface CreateSessionRequest {
  session_name: string;
  llm_config_id: number;
  training_mode: string;
  session_config: any;
}

export interface TestWorkspaceRequest {
  test_scenarios: Array<{
    input: string;
    expected_output?: string;
  }>;
  llm_config_id: number;
  evaluation_mode: string;
}

export const trainingLabService = {
  // Workspace Management
  async getWorkspaces(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const response = await api.get(`/training-lab/workspaces?${queryParams}`);
    return response.data;
  },

  async createWorkspace(
    data: CreateWorkspaceRequest
  ): Promise<TrainingWorkspace> {
    const response = await api.post("/training-lab/workspaces", data);
    return response.data;
  },

  async getWorkspace(id: number): Promise<TrainingWorkspace> {
    const response = await api.get(`/training-lab/workspaces/${id}`);
    return response.data;
  },

  async updateWorkspace(
    id: number,
    data: UpdateWorkspaceRequest
  ): Promise<TrainingWorkspace> {
    const response = await api.put(`/training-lab/workspaces/${id}`, data);
    return response.data;
  },

  async deleteWorkspace(id: number): Promise<void> {
    await api.delete(`/training-lab/workspaces/${id}`);
  },

  // Testing and Evaluation
  async testWorkspace(
    id: number,
    data: TestWorkspaceRequest
  ): Promise<WorkspaceTestResult> {
    const response = await api.post(
      `/training-lab/workspaces/${id}/test`,
      data
    );
    return response.data;
  },

  // Training Sessions
  async getTrainingSessions(
    workspaceId: number,
    params?: {
      skip?: number;
      limit?: number;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get(
      `/training-lab/workspaces/${workspaceId}/sessions?${queryParams}`
    );
    return response.data;
  },

  async createTrainingSession(
    workspaceId: number,
    data: CreateSessionRequest
  ): Promise<TrainingSession> {
    const response = await api.post(
      `/training-lab/workspaces/${workspaceId}/sessions`,
      data
    );
    return response.data;
  },

  // Analytics
  async getAnalytics(timeframe?: string): Promise<TrainingAnalytics> {
    const params = timeframe ? `?timeframe=${timeframe}` : "";
    const response = await api.get(`/training-lab/analytics${params}`);
    return response.data;
  },

  // Templates
  async getTemplates(category?: string): Promise<TrainingTemplate[]> {
    const params = category ? `?category=${category}` : "";
    const response = await api.get(`/training-lab/templates${params}`);
    return response.data;
  },

  async importTemplate(workspaceId: number, templateId: number) {
    const response = await api.post(
      `/training-lab/workspaces/${workspaceId}/import-template`,
      {
        template_id: templateId,
      }
    );
    return response.data;
  },

  // Export and Import
  async exportWorkspace(id: number, format: string = "json") {
    const response = await api.post(`/training-lab/workspaces/${id}/export`, {
      format,
    });
    return response.data;
  },

  // LLM Configurations
  async getLLMConfigs(workspaceId?: number) {
    const params = workspaceId ? `?workspace_id=${workspaceId}` : "";
    const response = await api.get(`/training-lab/llm-configs${params}`);
    return response.data;
  },

  async createLLMConfig(data: any) {
    const response = await api.post("/training-lab/llm-configs", data);
    return response.data;
  },

  // Workflows
  async getWorkflows(workspaceId?: number) {
    const params = workspaceId ? `?workspace_id=${workspaceId}` : "";
    const response = await api.get(`/training-lab/workflows${params}`);
    return response.data;
  },

  async createWorkflow(data: any) {
    const response = await api.post("/training-lab/workflows", data);
    return response.data;
  },
};
