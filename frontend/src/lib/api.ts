export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw await this.handleError(response);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw await this.handleError(response);
    }
    return response.json();
  }

  private async handleError(response: Response): Promise<APIError> {
    const error: APIError = {
      message: 'An error occurred',
      status: response.status,
    };
    try {
      const data = await response.json();
      error.message = data.message || error.message;
      error.code = data.code;
    } catch {
      error.message = response.statusText || error.message;
    }
    return error;
  }
}
