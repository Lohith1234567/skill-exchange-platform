import apiClient from './api';

export const authService = {
  login: async (email, password) => {
    // TODO: Replace with actual API call
    return apiClient.post('/auth/login', { email, password });
  },

  signup: async (name, email, password) => {
    // TODO: Replace with actual API call
    return apiClient.post('/auth/signup', { name, email, password });
  },

  logout: async () => {
    // TODO: Replace with actual API call
    return apiClient.post('/auth/logout', {});
  },

  getCurrentUser: async () => {
    // TODO: Replace with actual API call
    return apiClient.get('/auth/me');
  },
};
