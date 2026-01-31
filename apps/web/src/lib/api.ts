const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Wystąpił błąd' }));
    throw new Error(error.message || 'Wystąpił błąd');
  }
  
  return response.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; user: { id: string; email: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  register: (email: string, password: string) =>
    apiFetch<{ accessToken: string; user: { id: string; email: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  me: (token: string) =>
    apiFetch<{ id: string; email: string }>('/api/auth/me', { token }),
};

// Seller Profile
export const sellerProfileApi = {
  get: (token: string) =>
    apiFetch<any>('/api/seller-profile', { token }),
    
  update: (token: string, data: any) =>
    apiFetch<any>('/api/seller-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),
};

// Clients
export const clientsApi = {
  getAll: (token: string) =>
    apiFetch<any[]>('/api/clients', { token }),
    
  getById: (token: string, id: string) =>
    apiFetch<any>(`/api/clients/${id}`, { token }),
    
  create: (token: string, data: any) =>
    apiFetch<any>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
    
  update: (token: string, id: string, data: any) =>
    apiFetch<any>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),
    
  delete: (token: string, id: string) =>
    apiFetch<any>(`/api/clients/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// Invoice Templates
export const templatesApi = {
  getAll: (token: string) =>
    apiFetch<any[]>('/api/templates', { token }),
    
  getById: (token: string, id: string) =>
    apiFetch<any>(`/api/templates/${id}`, { token }),
    
  create: (token: string, data: any) =>
    apiFetch<any>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
    
  update: (token: string, id: string, data: any) =>
    apiFetch<any>(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),
    
  toggle: (token: string, id: string) =>
    apiFetch<any>(`/api/templates/${id}/toggle`, {
      method: 'PATCH',
      token,
    }),
    
  issueNow: (token: string, id: string) =>
    apiFetch<any>(`/api/templates/${id}/issue-now`, {
      method: 'POST',
      token,
    }),
    
  delete: (token: string, id: string) =>
    apiFetch<any>(`/api/templates/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// Invoices
export const invoicesApi = {
  getAll: (token: string, filters?: { month?: number; year?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', String(filters.month));
    if (filters?.year) params.append('year', String(filters.year));
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<any[]>(`/api/invoices${query}`, { token });
  },
    
  getById: (token: string, id: string) =>
    apiFetch<any>(`/api/invoices/${id}`, { token }),
    
  downloadPdf: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/invoices/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Nie udało się pobrać PDF');
    return response.blob();
  },
    
  resendEmail: (token: string, id: string) =>
    apiFetch<any>(`/api/invoices/${id}/resend`, {
      method: 'POST',
      token,
    }),
};
