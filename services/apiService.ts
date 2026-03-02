import axios from 'axios';
import { getAnonymousId } from '@/lib/identify';

const envBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
const normalizedEnvBase = envBackendUrl
  ? `${envBackendUrl.replace(/\/+$/, '')}/api/v1`
  : '';

const isDev = import.meta.env.DEV;
export const API_BASE_URL = normalizedEnvBase || (isDev ? 'http://localhost:8080/api/v1' : 'https://seeqme.com/api/v1');
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to handle 401s, tokens, and stable anonymous identity
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // stable anonymous ID for consistent tracking/rate-limiting
  config.headers['X-Anonymous-ID'] = getAnonymousId();

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register') || error.config?.url?.includes('/auth/me');

    // if (error.response && error.response.status === 401 && !isAuthRoute) {
    //   // Dispatch event for App.tsx to handle
    //   window.dispatchEvent(new Event('session-expired'));
    //   localStorage.removeItem('token');
    // }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post(`/auth/login`, { email, password });
    return response.data;
  },
  register: async (email: string, password: string, fullName: string) => {
    const response = await apiClient.post(`/auth/register`, { email, password, fullName });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

// Portfolio Services
export const portfolioService = {
  getPortfolios: async () => {
    const response = await apiClient.get('/portfolios');
    return response.data;
  },
  getPortfolio: async (id: string) => {
    const response = await apiClient.get(`/portfolios/${id}`);
    return response.data;
  },
  createPortfolio: async (data: any) => {
    const response = await apiClient.post('/portfolios', data);
    return response.data;
  },
  updatePortfolio: async (id: string, data: any) => {
    const response = await apiClient.put(`/portfolios/${id}`, data);
    return response.data;
  },
  deletePortfolio: async (id: string) => {
    const response = await apiClient.delete(`/portfolios/${id}`);
    return response.data;
  },
  publishPortfolio: async (id: string) => {
    const response = await apiClient.post(`/portfolios/${id}/publish`);
    return response.data;
  },
  undoPortfolio: async (id: string) => {
    const response = await apiClient.post(`/portfolios/${id}/undo`);
    return response.data;
  },
  getAnalytics: async (id: string) => {
    const response = await apiClient.get(`/portfolios/${id}/analytics`);
    return response.data;
  },
};

// AI Services
export const aiService = {
  generatePortfolio: async (
    promptOrConfig: string | any,
    template?: string,
    files?: any[],
    niche?: string,
    theme?: string,
    sessionId?: string
  ) => {
    let body: any;
    if (typeof promptOrConfig === 'string') {
      body = {
        prompt: promptOrConfig,
        template,
        files,
        niche,
        theme,
        sessionId,
      };
    } else {
      // It's an object config (e.g. from redesignLayout)
      body = {
        prompt: promptOrConfig.value || promptOrConfig.prompt,
        template: promptOrConfig.template || template,
        files: promptOrConfig.files || files,
        niche: promptOrConfig.niche || niche,
        theme: promptOrConfig.theme || theme,
        provider: promptOrConfig.provider,
        portfolioId: promptOrConfig.portfolioId,
        sessionId: promptOrConfig.sessionId || sessionId,
      };
    }

    const response = await apiClient.post('/ai/generate', body);
    return response.data;
  },
  editPortfolio: async (structuredContent: any, instruction: string, portfolioId?: string, files?: any[]) => {
    const response = await apiClient.post('/ai/edit', {
      structuredContent,
      instruction,
      portfolioId,
      files,
    });
    return response.data;
  },
  generateCode: async (structuredContent: any, portfolioId: string) => {
    const response = await apiClient.post('/ai/generate-code', {
      structuredContent,
      portfolioId,
    });
    return response.data;
  },
};

// Upload Services
export const uploadService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // returns { url, public_id }
  },
  deleteFile: async (publicId: string) => {
    const response = await apiClient.delete(`/upload?public_id=${publicId}`);
    return response.data;
  },
  extractCV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/cv/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Domain Services
export const domainService = {
  getDomains: async () => {
    const response = await apiClient.get('/domains');
    return response.data;
  },
  createDomain: async (domain: string, portfolioId: string) => {
    const response = await apiClient.post('/domains', { domain, portfolioId });
    return response.data;
  },
  verifyDomain: async (id: string) => {
    const response = await apiClient.post(`/domains/${id}/verify`);
    return response.data;
  },
  updateDomain: async (id: string, portfolioId: string) => {
    const response = await apiClient.put(`/domains/${id}`, { portfolioId });
    return response.data;
  },
  deleteDomain: async (id: string) => {
    const response = await apiClient.delete(`/domains/${id}`);
    return response.data;
  },
};

// Deployment Services
export const deploymentService = {
  validateUpdate: async (portfolioId: string, html: string, css: string, js: string) => {
    const response = await apiClient.post('/deployment/validate', {
      portfolioId,
      html,
      css,
      js,
    });
    return response.data;
  },
  publishUpdate: async (portfolioId: string, html: string, css: string, js: string, skipValidation?: boolean) => {
    const response = await apiClient.post('/deployment/publish', {
      portfolioId,
      html,
      css,
      js,
      skipValidation,
    });
    return response.data;
  },
  deployPortfolio: async (portfolioId: string, subdomain?: string, customDomainId?: string) => {
    const response = await apiClient.post('/deployment/deploy', {
      portfolioId,
      subdomain,
      customDomainId,
    });
    return response.data;
  },
  getDeploymentStatus: async (portfolioId: string) => {
    const response = await apiClient.get(`/deployment/status/${portfolioId}`);
    return response.data;
  },
  rollbackDeployment: async (portfolioId: string) => {
    const response = await apiClient.post(`/deployment/rollback/${portfolioId}`);
    return response.data;
  },
};

// Subscription Services
export const subscriptionService = {
  getSubscription: async () => {
    const response = await apiClient.get('/subscription');
    return response.data;
  },
  verifyPayment: async (reference: string, plan: string, gateway: string, period: string, amount: number, currency: string) => {
    const response = await apiClient.post('/subscription/verify', { reference, plan, gateway, period, amount, currency });
    return response.data;
  },
};

// Contact Services
export const contactService = {
  sendContactForm: async (email: string, subject: string, message: string) => {
    const response = await apiClient.post('/contact', { email, subject, message });
    return response.data;
  },
};

// Admin Services
export const adminService = {
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  updateUserPermissions: async (userId: string, data: { roles: string[]; adminPageAccess: string[] }) => {
    const response = await apiClient.put(`/admin/users/${userId}/permissions`, data);
    return response.data;
  },
  getAllPortfolios: async () => {
    const response = await apiClient.get('/admin/portfolios');
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
  deployOnBehalf: async (portfolioId: string) => {
    const response = await apiClient.post(`/admin/portfolios/${portfolioId}/deploy`);
    return response.data;
  },
  deletePortfolio: async (portfolioId: string) => {
    const response = await apiClient.delete(`/admin/portfolios/${portfolioId}`);
    return response.data;
  },
  getSystemConfig: async () => {
    const response = await apiClient.get('/admin/system-config');
    return response.data;
  },
  updateSystemConfig: async (data: any) => {
    const response = await apiClient.put('/admin/system-config', data);
    return response.data;
  },
  sendAdminEmail: async (data: any) => {
    const response = await apiClient.post('/admin/notifications/email', data);
    return response.data;
  },
  getAdminTemplates: async () => {
    const response = await apiClient.get('/admin/templates');
    return response.data;
  },
  createAdminTemplate: async (data: any) => {
    const response = await apiClient.post('/admin/templates', data);
    return response.data;
  },
  updateAdminTemplate: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/templates/${id}`, data);
    return response.data;
  },
  deleteAdminTemplate: async (id: string) => {
    const response = await apiClient.delete(`/admin/templates/${id}`);
    return response.data;
  },
};

// Public Config Services
export const configService = {
  getPricing: async () => {
    const response = await apiClient.get('/config/pricing');
    return response.data;
  },
};

// Templates (Public)
export const templateService = {
  getPublicTemplates: async () => {
    const response = await apiClient.get('/templates');
    return response.data;
  },
};

// Session Management Services
export const sessionService = {
  getActiveSession: async () => {
    try {
      const response = await apiClient.get('/sessions/active');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  getSession: async (id: string) => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
  },
};

export default apiClient;
