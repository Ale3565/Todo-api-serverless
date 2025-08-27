import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';

describe('Todo API Integration Tests', () => {
  let apiUrl: string;
  let testTodoId: string;

  beforeAll(async () => {
   
    apiUrl = process.env.API_URL || 'https://your-api-gateway-url.com';
    
    if (!apiUrl.startsWith('https://')) {
      console.warn('API_URL not set, skipping integration tests');
      return;
    }
  });

  it('should create a new todo', async () => {
    if (!apiUrl.startsWith('https://')) return;

    const response = await axios.post(`${apiUrl}/todos`, {
      title: 'Integration Test Todo',
      description: 'Created by integration test'
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.title).toBe('Integration Test Todo');
    
    testTodoId = response.data.data.todoId;
  });

  it('should get the created todo', async () => {
    if (!apiUrl.startsWith('https://') || !testTodoId) return;

    const response = await axios.get(`${apiUrl}/todos/${testTodoId}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.todoId).toBe(testTodoId);
  });

  it('should list todos', async () => {
    if (!apiUrl.startsWith('https://')) return;

    const response = await axios.get(`${apiUrl}/todos`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.todos)).toBe(true);
  });

  it('should update the todo', async () => {
    if (!apiUrl.startsWith('https://') || !testTodoId) return;

    const response = await axios.put(`${apiUrl}/todos/${testTodoId}`, {
      title: 'Updated Integration Test Todo',
      completed: true
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.completed).toBe(true);
  });

  it('should delete the todo', async () => {
    if (!apiUrl.startsWith('https://') || !testTodoId) return;

    const response = await axios.delete(`${apiUrl}/todos/${testTodoId}`);

    expect(response.status).toBe(204);
  });
});