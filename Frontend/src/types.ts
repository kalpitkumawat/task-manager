export interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTaskRequest {
  description: string;
}

export interface UpdateTaskRequest {
  description?: string;
  isCompleted: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';
