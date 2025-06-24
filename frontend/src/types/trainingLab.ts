export interface TrainingWorkspace {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  agent_id: number;
  training_status: "draft" | "active" | "completed" | "archived";
  version: number;
  is_public: boolean;
  workspace_data_json: any;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  id: number;
  workspace_id: number;
  session_name: string;
  llm_config_id: number;
  training_mode: string;
  session_config: any;
  session_status:
    | "initializing"
    | "running"
    | "completed"
    | "failed"
    | "paused";
  progress_percentage: number;
  current_step: number;
  total_steps: number;
  session_data: any;
  results: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingAnalytics {
  total_workspaces: number;
  active_workspaces: number;
  completed_sessions: number;
  total_training_time: number;
  average_session_duration: number;
  success_rate: number;
  performance_trends: Array<{
    date: string;
    sessions_count: number;
    success_rate: number;
    average_duration: number;
  }>;
  popular_templates: Array<{
    template_id: number;
    template_name: string;
    usage_count: number;
  }>;
  workspace_performance: Array<{
    workspace_id: number;
    workspace_name: string;
    completion_rate: number;
    average_score: number;
  }>;
  generated_at: string;
}

export interface TrainingTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
  template_data: any;
  usage_count: number;
  rating: number;
  reviews_count: number;
  tags: string[];
  author?: string;
  version: string;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceTestResult {
  test_results: Array<{
    scenario_id: number;
    input: string;
    actual_output: string;
    expected_output?: string;
    evaluation_score: number;
    response_time: number;
    tokens_used: number;
    success: boolean;
    error_message?: string;
  }>;
  overall_score: number;
  total_tokens: number;
  total_cost: number;
  test_duration: number;
  success_rate: number;
}

export interface LLMConfig {
  id: number;
  workspace_id?: number;
  config_name: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  system_prompt?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingWorkflow {
  id: number;
  name: string;
  description?: string;
  steps: Array<{
    step_type: string;
    config: any;
  }>;
  evaluation_config: any;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}
