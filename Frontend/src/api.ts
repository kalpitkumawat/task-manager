import axios from 'axios';
import { Task, CreateTaskRequest, UpdateTaskRequest } from './types';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  // Get all tasks
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },

  // Create a new task
  createTask: async (request: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/tasks', request);
    return response.data;
  },

  // Update a task
  updateTask: async (id: string, request: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, request);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export default taskApi;
