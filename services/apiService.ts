import axios from 'axios';
import { getAnonymousId } from '@/lib/identify';

export const API_BASE_URL = 'https://seeqme.com/api/v1' //import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'// 'https://seeqme.com/api/v1'
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

  // Always include the stable anonymous ID for consistent tracking/rate-limiting
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
      // provider: 'openai',
    });
    return response.data;
  },
  generateCode: async (structuredContent: any, portfolioId: string) => {
    const response = await apiClient.post('/ai/generate-code', {
      structuredContent,
      portfolioId,
      // provider: 'openai',
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
    return response.data; // Now returns { url, public_id }
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
  deleteDomain: async (id: string) => {
    const response = await apiClient.delete(`/domains/${id}`);
    return response.data;
  },
};

// Deployment Services
export const deployService = {
  deploy: async (portfolioId: string, subdomain: string) => {
    const response = await apiClient.post('/deploy', { portfolioId, subdomain });
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
  verifyPayment: async (reference: string, plan: string, gateway: string, period: string) => {
    const response = await apiClient.post('/subscription/verify', { reference, plan, gateway, period });
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
  getAllPortfolios: async () => {
    const response = await apiClient.get('/admin/portfolios');
    return response.data;
  },
  deployOnBehalf: async (portfolioId: string) => {
    const response = await apiClient.post(`/admin/portfolios/${portfolioId}/deploy`);
    return response.data;
  },
};

export default apiClient;