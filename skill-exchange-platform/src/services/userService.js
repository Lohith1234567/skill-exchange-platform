import apiClient from './api';

export const userService = {
  getProfile: async (userId) => {
    return apiClient.get(`/users/${userId}`);
  },

  updateProfile: async (userId, data) => {
    return apiClient.put(`/users/${userId}`, data);
  },

  searchUsers: async (query) => {
    return apiClient.get(`/users/search?q=${query}`);
  },

  getUsersBySkill: async (skill) => {
    return apiClient.get(`/users/by-skill/${skill}`);
  },
};
