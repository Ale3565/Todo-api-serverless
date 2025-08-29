import { Todo, CreateTodoRequest, UpdateTodoRequest, ApiResponse } from '../../src/lambda/types/todo';

describe('Todo API Integration Tests', () => {
  let apiUrl: string;
  let testTodoId: string;

  beforeAll(async () => {
    
    apiUrl = process.env.API_URL || 'https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod/';
    
    if (!apiUrl.startsWith('https://')) {
      console.warn('API_URL not set, skipping integration tests');
      return;
    }

    
    if (!apiUrl.endsWith('/')) {
      apiUrl += '/';
    }
  });

  it('should skip integration tests when API_URL not configured', () => {
    if (!apiUrl.startsWith('https://')) {
      expect(true).toBe(true); 
      return;
    }
  });

  it('should create a new todo', async () => {
    if (!apiUrl.startsWith('https://')) {
      expect(true).toBe(true);
      return;
    }

    const createRequest: CreateTodoRequest = {
      title: 'Integration Test Todo',
      description: 'This is a test todo created by integration tests'
    };

    const response = await fetch(`${apiUrl}todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createRequest)
    });

    expect(response.status).toBe(201);
    
    const result: ApiResponse<Todo> = await response.json();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.title).toBe(createRequest.title);
    expect(result.data!.description).toBe(createRequest.description);
    expect(result.data!.completed).toBe(false);
    expect(result.data!.todoId).toBeDefined();
    expect(result.data!.createdAt).toBeDefined();
    expect(result.data!.updatedAt).toBeDefined();

    
    testTodoId = result.data!.todoId;
  }, 10000);

  it('should get the created todo', async () => {
    if (!apiUrl.startsWith('https://') || !testTodoId) {
      expect(true).toBe(true);
      return;
    }

    const response = await fetch(`${apiUrl}todos/${testTodoId}`);
    
    expect(response.status).toBe(200);
    
    const result: ApiResponse<Todo> = await response.json();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.todoId).toBe(testTodoId);
    expect(result.data!.title).toBe('Integration Test Todo');
    expect(result.data!.description).toBe('This is a test todo created by integration tests');
    expect(result.data!.completed).toBe(false);
  }, 10000);

  it('should list todos', async () => {
    if (!apiUrl.startsWith('https://')) {
      expect(true).toBe(true);
      return;
    }

    const response = await fetch(`${apiUrl}todos`);
    
    expect(response.status).toBe(200);
    
    const result: ApiResponse<{todos: Todo[], count: number}> = await response.json();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.todos).toBeDefined();
    expect(Array.isArray(result.data!.todos)).toBe(true);
    expect(typeof result.data!.count).toBe('number');
    
    
    if (testTodoId) {
      const testTodo = result.data!.todos.find(todo => todo.todoId === testTodoId);
      expect(testTodo).toBeDefined();
    }
  }, 10000);

  it('should update the todo', async () => {
    if (!apiUrl.startsWith('https://') || !testTodoId) {
      expect(true).toBe(true);
      return;
    }

    const updateRequest: UpdateTodoRequest = {
      title: 'Updated Integration Test Todo',
      description: 'This todo has been updated by integration tests',
      completed: true
    };

    const response = await fetch(`${apiUrl}todos/${testTodoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRequest)
    });

    expect(response.status).toBe(200);
    
    const result: ApiResponse<Todo> = await response.json();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.todoId).toBe(testTodoId);
    expect(result.data!.title).toBe(updateRequest.title);
    expect(result.data!.description).toBe(updateRequest.description);
    expect(result.data!.completed).toBe(true);
  }, 10000);

  it('should delete the todo', async () => {
    if (!apiUrl.startsWith('https://') || !testTodoId) {
      expect(true).toBe(true);
      return;
    }

    const response = await fetch(`${apiUrl}todos/${testTodoId}`, {
      method: 'DELETE'
    });

    expect(response.status).toBe(204);
    
    
    const responseText = await response.text();
    expect(responseText).toBe('');

   
    const getResponse = await fetch(`${apiUrl}todos/${testTodoId}`);
    expect(getResponse.status).toBe(404);
  }, 10000);

  it('should handle 404 for non-existent todo', async () => {
    if (!apiUrl.startsWith('https://')) {
      expect(true).toBe(true);
      return;
    }

    const response = await fetch(`${apiUrl}todos/non-existent-id`);
    expect(response.status).toBe(404);
  }, 10000);

  it('should handle validation errors for invalid requests', async () => {
    if (!apiUrl.startsWith('https://')) {
      expect(true).toBe(true);
      return;
    }

   
    const invalidRequest = {
      description: 'No title provided'
    };

    const response = await fetch(`${apiUrl}todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRequest)
    });

    expect(response.status).toBe(400);
    
    const result: ApiResponse = await response.json();
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  }, 10000);
});