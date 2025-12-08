
import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost for dev
// Note: For Android APK, localhost refers to the device itself. You will need to change this 
// to your computer's IP address (e.g., http://192.168.1.5:5000/api) or a hosted server URL for testing on phone.
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data), 
};

// Data Services
export const productService = {
  getAll: () => api.get('/products'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const orderService = {
  getAll: () => api.get('/orders'), // Admin
  getMyOrders: () => api.get('/orders/myorders'),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
};

export const inventoryService = {
  getAll: () => api.get('/inventory'),
  add: (items: any[]) => api.post('/inventory', { items }),
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

export const userService = {
    getAll: () => api.get('/users'),
    updateBalance: (id: string, amount: number, type: 'add' | 'deduct') => api.put(`/users/${id}/balance`, { amount, type }),
    updateStatus: (id: string) => api.put(`/users/${id}/status`, {}),
};

export const walletService = {
    getTransactions: () => api.get('/wallet/transactions'),
    deposit: (data: any) => api.post('/wallet/deposit', data),
};

export const paymentService = {
    charge: (data: any) => api.post('/payments/charge', data),
};

export const contentService = {
    getBanners: () => api.get('/content/banners'),
    createBanner: (data: any) => api.post('/content/banners', data),
    deleteBanner: (id: number) => api.delete(`/content/banners/${id}`),
    
    getAnnouncements: () => api.get('/content/announcements'),
    createAnnouncement: (data: any) => api.post('/content/announcements', data),
    deleteAnnouncement: (id: string) => api.delete(`/content/announcements/${id}`),

    getCategories: () => api.get('/content/categories'),
    createCategory: (data: any) => api.post('/content/categories', data),
    deleteCategory: (id: string) => api.delete(`/content/categories/${id}`),
};

export default api;