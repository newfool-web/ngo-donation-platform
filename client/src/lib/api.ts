const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string }[];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.headers.get('content-type')?.includes('application/pdf')) {
    const blob = await response.blob();
    return { success: true, data: blob as any };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/auth/profile'),

  // Schemes
  getSchemes: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/schemes${query}`);
  },
  getScheme: (id: string) => request(`/schemes/${id}`),
  getCategories: () => request<string[]>('/schemes/categories'),
  getDistricts: () => request<string[]>('/schemes/districts'),

  // Eligibility
  checkEligibility: (body: any) => request('/eligibility/check', { method: 'POST', body: JSON.stringify(body) }),

  // Campaigns
  getCampaigns: () => request('/campaigns'),
  getCampaign: (id: string) => request(`/campaigns/${id}`),

  // Donations
  createDonation: (body: any) => request('/donations', { method: 'POST', body: JSON.stringify(body) }),
  getMyDonations: () => request('/donations/my'),
  getDonation: (id: string) => request(`/donations/${id}`),
  downloadReceipt: (id: string) =>
    fetch(`${API_BASE}/donations/${id}/receipt`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.blob()),
  downloadCertificate: (id: string) =>
    fetch(`${API_BASE}/donations/${id}/certificate`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.blob()),

  // Admin
  getStats: () => request('/admin/stats'),
  getRecentDonations: () => request('/admin/donations/recent'),
  getAllSchemes: () => request('/admin/schemes'),
  createScheme: (body: any) => request('/admin/schemes', { method: 'POST', body: JSON.stringify(body) }),
  updateScheme: (id: string, body: any) => request(`/admin/schemes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleSchemePublish: (id: string) => request(`/admin/schemes/${id}/toggle-publish`, { method: 'PATCH' }),
  generateSchemeSummary: (id: string) => request(`/admin/schemes/${id}/generate-summary`, { method: 'POST' }),
  approveSchemeSummary: (id: string) => request(`/admin/schemes/${id}/approve-summary`, { method: 'PATCH' }),
  getAllCampaigns: () => request('/admin/campaigns'),
  createCampaign: (body: any) => request('/admin/campaigns', { method: 'POST', body: JSON.stringify(body) }),
  updateCampaign: (id: string, body: any) => request(`/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleCampaignStatus: (id: string) => request(`/admin/campaigns/${id}/toggle-status`, { method: 'PATCH' }),
  getCampaignReport: (id: string) => request(`/admin/campaigns/${id}/report`),
};
