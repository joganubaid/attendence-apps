import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'https://your-flask-backend.onrender.com'; // Replace with your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Replace with your token storage method
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Classroom API endpoints
export const classroomAPI = {
  // Get all classrooms for the user
  getClassrooms: () => api.get('/classrooms'),
  
  // Create a new classroom
  createClassroom: (data) => api.post('/classrooms', data),
  
  // Get classroom details
  getClassroom: (id) => api.get(`/classrooms/${id}`),
  
  // Update classroom
  updateClassroom: (id, data) => api.put(`/classrooms/${id}`, data),
  
  // Delete classroom
  deleteClassroom: (id) => api.delete(`/classrooms/${id}`),
  
  // Join classroom with invite code
  joinClassroom: (inviteCode) => api.post('/classrooms/join', { inviteCode }),
  
  // Generate invite link/QR code
  generateInvite: (classroomId) => api.post(`/classrooms/${classroomId}/invite`),
  
  // Get classroom members
  getMembers: (classroomId) => api.get(`/classrooms/${classroomId}/members`),
  
  // Update member role
  updateMemberRole: (classroomId, memberId, role) => 
    api.put(`/classrooms/${classroomId}/members/${memberId}`, { role }),
  
  // Remove member
  removeMember: (classroomId, memberId) => 
    api.delete(`/classrooms/${classroomId}/members/${memberId}`),
};

// Materials API endpoints
export const materialsAPI = {
  // Get materials for a classroom
  getMaterials: (classroomId, filters = {}) => 
    api.get(`/classrooms/${classroomId}/materials`, { params: filters }),
  
  // Upload material
  uploadMaterial: (classroomId, formData) => 
    api.post(`/classrooms/${classroomId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Update material
  updateMaterial: (classroomId, materialId, data) => 
    api.put(`/classrooms/${classroomId}/materials/${materialId}`, data),
  
  // Delete material
  deleteMaterial: (classroomId, materialId) => 
    api.delete(`/classrooms/${classroomId}/materials/${materialId}`),
  
  // Pin/unpin material
  togglePin: (classroomId, materialId) => 
    api.put(`/classrooms/${classroomId}/materials/${materialId}/pin`),
  
  // Download material
  downloadMaterial: (classroomId, materialId) => 
    api.get(`/classrooms/${classroomId}/materials/${materialId}/download`),
};

// Announcements API endpoints
export const announcementsAPI = {
  // Get announcements for a classroom
  getAnnouncements: (classroomId) => api.get(`/classrooms/${classroomId}/announcements`),
  
  // Create announcement
  createAnnouncement: (classroomId, data) => 
    api.post(`/classrooms/${classroomId}/announcements`, data),
  
  // Update announcement
  updateAnnouncement: (classroomId, announcementId, data) => 
    api.put(`/classrooms/${classroomId}/announcements/${announcementId}`, data),
  
  // Delete announcement
  deleteAnnouncement: (classroomId, announcementId) => 
    api.delete(`/classrooms/${classroomId}/announcements/${announcementId}`),
};

// Auth API endpoints
export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register
  register: (userData) => api.post('/auth/register', userData),
  
  // Refresh token
  refreshToken: () => api.post('/auth/refresh'),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return `Bad request: ${data.message || 'Invalid data provided'}`;
        case 401:
          return 'Unauthorized: Please log in again';
        case 403:
          return 'Forbidden: You don\'t have permission to perform this action';
        case 404:
          return 'Not found: The requested resource was not found';
        case 500:
          return 'Server error: Please try again later';
        default:
          return data.message || 'An unexpected error occurred';
      }
    } else if (error.request) {
      // Network error
      return 'Network error: Please check your internet connection';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred';
    }
  },
  
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Validate file type
  validateFileType: (file, allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png']) => {
    const extension = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(extension);
  },
  
  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
};

export default api;